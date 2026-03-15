
import React, { useState, useEffect, useCallback, useRef, lazy, Suspense } from 'react';
import { NavTab, RadioEvent } from './types';

// Componentes críticos - carga inmediata
import HomeView from './components/HomeView';
import PlayerBar from './components/PlayerBar';
import { Logo } from './components/Logo';

// Componentes no críticos - lazy loading
const VideoView = lazy(() => import('./components/VideoView'));
const ShortsView = lazy(() => import('./components/ShortsView'));
const EventsView = lazy(() => import('./components/EventsView'));
const ChatAssistant = lazy(() => import('./components/ChatAssistant'));
const MusicLibraryView = lazy(() => import('./components/MusicLibraryView'));
const PollsView = lazy(() => import('./components/PollsView'));
const LiveGreetingsView = lazy(() => import('./components/LiveGreetingsView'));
const SettingsView = lazy(() => import('./components/SettingsView'));

import { GoogleGenAI, Modality } from "@google/genai";
import { DEFAULT_HOURLY_SCRIPTS, MORNING_HOURLY_SCRIPTS, DEFAULT_JINGLES, MOCK_EVENTS, RADIO_STREAM_URL } from './constants';
import { decodeAudioData } from './utils/audioUtils';
import { subscribeToRadioEvents, onRadioConnectionChange, supabaseAnonKey } from './services/supabase';
import { generateGeminiSpeech, decodeGeminiAudio, playGeminiAudio } from './services/geminiTTSService';
import ErrorBoundary from './components/ErrorBoundary';

// --- TYPES ---
interface NavItemProps {
  icon: string;
  label: string;
  color: string;
  active: boolean;
  onClick: () => void;
  hasIndicator?: boolean;
}

interface MobileIconProps {
  icon: string;
  color: string;
  active: boolean;
  onClick: () => void;
  hasIndicator?: boolean;
}

interface NavigationEvent extends CustomEvent {
  detail: NavTab;
}

interface PlaybackEvent extends CustomEvent {
  detail: { action: 'play' | 'pause' };
}

// --- MAIN APP ---
const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<NavTab>(NavTab.HOME);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDjAnnouncing, setIsDjAnnouncing] = useState(false);
  const [isDjThinking, setIsDjThinking] = useState(false);
  const [hasUpcomingEvents, setHasUpcomingEvents] = useState(false);

  // Refs for audio persistence (prevent GC on mobile)
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);
  const voiceAudioRef = useRef<HTMLAudioElement | null>(null); // Para saludos de voz grabados
  const lastAnnouncedMinute = useRef<number>(-1);
  const audioCtxRef = useRef<AudioContext | null>(null);
  // Previene race condition: si initAudio se llama dos veces simultaneamente
  const audioCtxInitPromise = useRef<Promise<AudioContext> | null>(null);

  const initAudio = useCallback(async () => {
    // Si ya existe y está activo, reutilizar
    if (audioCtxRef.current) {
      if (audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }
      return audioCtxRef.current;
    }
    // Si ya hay una inicialización en curso, esperar a que termine
    if (audioCtxInitPromise.current) {
      return audioCtxInitPromise.current;
    }
    // Inicializar por primera vez
    audioCtxInitPromise.current = (async () => {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({ sampleRate: 24000 });
      audioCtxRef.current = ctx;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      return ctx;
    })();
    return audioCtxInitPromise.current;
  }, []);



  // Sincronizar isDjAnnouncing con window._djAnnouncing para que LiveGreetingsView pueda leerlo
  useEffect(() => {
    (window as any)._djAnnouncing = isDjAnnouncing || isDjThinking;
  }, [isDjAnnouncing, isDjThinking]);

  // Inicialización: Forzar señal principal al abrir la app + Watchdog
  useEffect(() => {
    localStorage.setItem('radio_stream_url_active', RADIO_STREAM_URL);
    window.dispatchEvent(new Event('radio_url_changed'));

    // Iniciar el vigilante de conexión
    import('./services/supabase').then(m => m.startConnectionWatchdog());
  }, []);

  // Escuchar eventos globales para sincronizar botones y AI
  useEffect(() => {
    const handleNavigation = (e: Event) => setActiveTab((e as NavigationEvent).detail);
    const handlePlayback = (e: Event) => setIsPlaying((e as PlaybackEvent).detail.action === 'play');
    const handleStop = () => setIsPlaying(false);

    window.addEventListener('navigate_to_tab', handleNavigation);
    window.addEventListener('radio_playback_control', handlePlayback);
    window.addEventListener('stop_radio_signal', handleStop);

    return () => {
      window.removeEventListener('navigate_to_tab', handleNavigation);
      window.removeEventListener('radio_playback_control', handlePlayback);
      window.removeEventListener('stop_radio_signal', handleStop);
    };
  }, []);

  // --- COMMERCIAL SCHEDULER (La Machi & Orquesta) ---
  // Plays 3 times a day each, alternating to avoid collision.
  useEffect(() => {
    const checkCommercial = async () => {
      if (!isPlaying || !audioCtxRef.current) return;

      const now = new Date();
      const hour = now.getHours();
      const min = now.getMinutes();

      // AVOID COLLISION: Only check at minute 20 (safe from 00, 10, 15, 30, 45)
      if (min !== 20) return;

      let adText = "";
      let adTag = "";

      // SCHEDULE:
      // La Machi: 08:20, 13:20, 19:20
      // Orquesta: 10:20, 16:20, 21:20
      // Entrust: 12:20, 17:20, 23:20
      if (hour === 8 || hour === 13 || hour === 19) {
        adTag = "MACHI";
      } else if (hour === 10 || hour === 16 || hour === 21) {
        adTag = "ORQUESTA";
      } else if (hour === 12 || hour === 17 || hour === 23) {
        adTag = "ENTRUST";
      } else {
        return;
      }

      const lastPlayedKey = `last_ad_play_${adTag}_${hour}`;
      const lockKey = `ad_lock_${adTag}_${hour}`;
      const hasPlayedThisHour = localStorage.getItem(lastPlayedKey) === 'true';

      // Prevenir que múltiples tabs reproduzcan el mismo comercial simultáneamente
      const lockTime = localStorage.getItem(lockKey);
      const isLockedByAnotherTab = lockTime && (Date.now() - parseInt(lockTime)) < 30000;

      if (!hasPlayedThisHour && !isLockedByAnotherTab) {
        console.log(`📣 [Commercial] Time for ${adTag}!`);
        // Adquirir lock inmediatamente para que otros tabs lo vean
        localStorage.setItem(lockKey, String(Date.now()));

        try {
          await initAudio();
          const constants = await import('./constants');

          if (adTag === "MACHI") adText = constants.STARTUP_COMMERCIAL_TEXT;
          else if (adTag === "ORQUESTA") adText = constants.STARTUP_ORQUESTA_TEXT;
          else if (adTag === "ENTRUST") adText = constants.STARTUP_ENTRUST_TEXT;

          const base64 = await generateGeminiSpeech(adText, 'Kore');
          if (base64 && audioCtxRef.current) {
            const buffer = await decodeGeminiAudio(base64, audioCtxRef.current);
            if (buffer) {
              playGeminiAudio(buffer, audioCtxRef.current);
              localStorage.setItem(lastPlayedKey, 'true');
              console.log(`📣 [Commercial] ${adTag} played successfully!`);

              // Cleanup keys from other hours to keep storage clean
              setTimeout(() => {
                for (let i = 0; i < 24; i++) {
                  if (i !== hour) {
                    localStorage.removeItem(`last_ad_play_${adTag}_${i}`);
                  }
                }
              }, 5000);
            }
          }
        } catch (e) {
          console.error('Failed to play commercial:', e);
        }
      }
    };

    // Check every minute
    const interval = setInterval(checkCommercial, 60000);
    // Also check on mount
    setTimeout(checkCommercial, 5000);

    return () => clearInterval(interval);
  }, [isPlaying, initAudio]);

  // Escuchar saludos en vivo (Global Broadcast)
  useEffect(() => {
    const handleGreeting = async (greeting: any) => {
      // Evitar ECO: si este dispositivo ya lo reprodujo localmente, ignorar
      if (!(window as any)._locallyPlayedIds) {
        (window as any)._locallyPlayedIds = new Set<string>();
      }
      const locallyPlayed = (window as any)._locallyPlayedIds as Set<string>;
      const greetingId = greeting.id || greeting.created_at;
      if (greetingId && locallyPlayed.has(greetingId)) {
        console.log('🔇 Saludo ignorado (ya reproducido localmente, evitando eco):', greetingId);
        locallyPlayed.delete(greetingId);
        return;
      }

      // Esperar si ya hay audio TTS reproduciéndose (evitar dos DJs simultáneos)
      if (isDjAnnouncing) {
        console.log('🔇 Saludo en cola - DJ ya está al aire, esperando 4s...');
        await new Promise(r => setTimeout(r, 4000));
      }

      console.log('🗣️ Reproduciendo saludo:', greeting);

      // Feedback visual para el usuario (Overlay DJ AI)
      setIsDjThinking(true);

      // Los campos de la DB son: from_name, to_name, message, audio_url
      const fromName = greeting.from_name || greeting.from || 'Alguien';
      const toName = greeting.to_name || greeting.to || 'Todos';
      const msg = greeting.message || '';
      const audioUrl = greeting.audio_url;

      // 🎤 CASO 1: Saludo de VOZ (grabado con micrófono)
      if (audioUrl) {
        console.log('🎤 Saludo de VOZ detectado:', audioUrl);
        setIsDjThinking(false);
        setIsDjAnnouncing(true);

        try {
          // 1. Descargar el audio CON autenticación de Supabase
          //    (el Audio element no puede enviar headers, por eso usamos fetch)
          console.log('🎤 Descargando audio con autenticación...');
          const response = await fetch(audioUrl, {
            headers: {
              'apikey': supabaseAnonKey,
              'Authorization': `Bearer ${supabaseAnonKey}`
            }
          });

          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }

          // 2. Crear Blob URL local (esto sí funciona con Audio element)
          const blob = await response.blob();
          const blobUrl = URL.createObjectURL(blob);
          console.log('🎤 Audio descargado, tamaño:', blob.size, 'bytes, tipo:', blob.type);

          // 3. Ducking: bajar volumen de la radio
          window.dispatchEvent(new CustomEvent('radio_volume_change', { detail: { level: 0.1 } }));

          // 4. Reproducir desde el blob local
          const audio = new Audio(blobUrl);
          voiceAudioRef.current = audio; // Prevenir garbage collection

          audio.onended = () => {
            console.log('🎤 Saludo de voz terminado OK');
            setIsDjAnnouncing(false);
            voiceAudioRef.current = null;
            URL.revokeObjectURL(blobUrl);
            window.dispatchEvent(new CustomEvent('radio_volume_change', { detail: { level: 0.8 } }));
          };

          audio.onerror = (e) => {
            console.error('🎤 Error reproduciendo blob de audio:', e);
            setIsDjAnnouncing(false);
            voiceAudioRef.current = null;
            URL.revokeObjectURL(blobUrl);
            window.dispatchEvent(new CustomEvent('radio_volume_change', { detail: { level: 0.8 } }));
          };

          await audio.play();
          console.log('🎤 Reproducción iniciada correctamente');

        } catch (err) {
          console.error('🎤 Error completo en saludo de voz:', err);
          setIsDjAnnouncing(false);
          window.dispatchEvent(new CustomEvent('radio_volume_change', { detail: { level: 0.8 } }));
        }
        return;
      }

      // 📝 CASO 2: Saludo de TEXTO (se genera con TTS)
      // Si el mensaje es largo (> 40 caracteres) o ya contiene palabras clave de la IA, 
      // lo usamos directamente para evitar redundancias con el template clásico.
      const isAlreadyProfessional = msg.length > 40 || msg.includes('La Nueva') || msg.includes('5:40');

      const greetingText = isAlreadyProfessional
        ? msg
        : `¡Tenemos un saludo! Para ${toName}, de parte de ${fromName}. ${msg ? 'Dice: ' + msg : ''}. ¡Un abrazo grande de parte de La Nueva cinco cuarenta radio!`;

      try {
        // 1. Generar audio con Gemini TTS
        const base64Audio = await generateGeminiSpeech(greetingText, 'Kore');
        if (!base64Audio) throw new Error('Gemini TTS returned empty');

        // 2. Inicializar contexto si es necesario
        const ctx = await initAudio();
        if (!ctx) throw new Error('AudioContext failed');

        // 3. Decodificar
        const buffer = await decodeGeminiAudio(base64Audio, ctx);
        if (!buffer) throw new Error('Audio decode failed');

        // 4. Reproducir (con ducking automático incluido en playGeminiAudio)
        setIsDjThinking(false);
        setIsDjAnnouncing(true); // Mostrar "AL AIRE"

        const source = playGeminiAudio(
          buffer,
          ctx,
          undefined, // onStart
          () => {    // onEnd
            setIsDjAnnouncing(false);
            sourceRef.current = null;
          }
        );
        sourceRef.current = source;

      } catch (err) {
        console.error('Gemini TTS failed, using native fallback:', err);
        // FALLBACK: Usar TTS nativa del navegador
        setIsDjThinking(false);
        setIsDjAnnouncing(true);

        if ('speechSynthesis' in window) {
          // Cancelar cualquier audio anterior (importante para móviles)
          window.speechSynthesis.cancel();

          // Bajar volumen de la radio
          window.dispatchEvent(new CustomEvent('radio_volume_change', { detail: { level: 0.1 } }));

          const utterance = new SpeechSynthesisUtterance(greetingText);
          speechRef.current = utterance; // Keep alive to prevent GC

          utterance.lang = 'es-ES';
          utterance.rate = 0.9;
          utterance.pitch = 1.0;
          const restoreVolume = () => {
            setIsDjAnnouncing(false);
            speechRef.current = null;
            window.dispatchEvent(new CustomEvent('radio_volume_change', { detail: { level: 0.8 } }));
          };
          utterance.onend = restoreVolume;
          utterance.onerror = restoreVolume;

          try {
            window.speechSynthesis.speak(utterance);
          } catch {
            restoreVolume();
          }
        } else {
          setIsDjAnnouncing(false);
        }
      }
    };

    const unsubscribe = subscribeToRadioEvents(handleGreeting);
    const unsubscribeStatus = onRadioConnectionChange((status, details) => {
      if (status === 'SUBSCRIBED') console.log('✅ RADIO ONLINE');
      if (status === 'LOCAL_MODE') console.log('⚠️ RADIO LOCAL MODE', details);
    });

    return () => {
      unsubscribe();
      unsubscribeStatus();
    };
  }, [initAudio]);

  // Detectar URL secreta para panel de admin de saluditos
  useEffect(() => {
    const checkSecretAccess = () => {
      const hash = window.location.hash;
      if (hash === '#admin-saluditos') {
        setActiveTab(NavTab.GREETINGS);
        // Limpiar el hash para no revelar la URL
        window.history.replaceState(null, '', window.location.pathname + window.location.search);
      }
    };

    checkSecretAccess();
    window.addEventListener('hashchange', checkSecretAccess);

    return () => {
      window.removeEventListener('hashchange', checkSecretAccess);
    };
  }, []);

  const checkUpcomingEvents = useCallback(() => {
    const saved = localStorage.getItem('radio_events');
    const list: RadioEvent[] = saved ? JSON.parse(saved) : MOCK_EVENTS;
    const now = new Date();
    const next24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

    const upcoming = list.some(event => {
      const eventDate = new Date(event.date);
      return eventDate >= now && eventDate <= next24h;
    });
    setHasUpcomingEvents(upcoming);
  }, []);

  useEffect(() => {
    checkUpcomingEvents();
    window.addEventListener('radio_content_updated', checkUpcomingEvents);
    return () => window.removeEventListener('radio_content_updated', checkUpcomingEvents);
  }, [checkUpcomingEvents]);



  const triggerAnnouncement = useCallback(async (type: 'hourly' | 'jingle', force = false, overrideText?: string) => {
    if (!isPlaying && !force) return;
    if (isDjAnnouncing || isDjThinking) return;

    setIsDjThinking(true);

    const performRequest = async (): Promise<string | undefined> => {
      const apiKey = process.env.API_KEY;
      if (!apiKey) return undefined;
      const ai = new GoogleGenAI({ apiKey });

      let baseText = "";
      if (overrideText) {
        baseText = overrideText;
      } else if (type === 'hourly') {
        const now = new Date();
        const horaStr = now.toLocaleTimeString('es-PE', { hour: 'numeric', minute: '2-digit', hour12: true });
        // Antes de las 8am usar scripts matutinos cortos (hora escolar)
        const isMorning = now.getHours() < 8;
        const scripts = isMorning
          ? MORNING_HOURLY_SCRIPTS
          : JSON.parse(localStorage.getItem('radio_hourly_scripts') || JSON.stringify(DEFAULT_HOURLY_SCRIPTS));
        baseText = scripts[Math.floor(Math.random() * scripts.length)].replace("{hora}", horaStr);
      } else {
        const jingles = JSON.parse(localStorage.getItem('radio_jingles') || JSON.stringify(DEFAULT_JINGLES));
        // Si es jingle normal, evitar el primero (índice 0) porque es el del evento especial, para que no salga repetido al azar
        // Salvo que solo haya 1
        let availableJingles = jingles;
        if (jingles.length > 1) {
          availableJingles = jingles.slice(1);
        }
        baseText = availableJingles[Math.floor(Math.random() * availableJingles.length)];
      }

      console.log('🎙️ DJ Generando:', baseText);

      const fullPrompt = `Actúa como locutor carismático de la radio peruana 'La Nueva cinco cuarenta radio'. Con mucha energía y sabor, di: ${baseText}`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash-preview-tts",
        contents: [{ parts: [{ text: fullPrompt }] }],
        config: {
          responseModalities: [Modality.AUDIO],
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } },
        },
      });
      return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
    };

    try {
      const ctx = await initAudio();
      const base64 = await performRequest();
      setIsDjThinking(false);
      if (base64 && ctx) {
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        const buffer = await decodeAudioData(bytes, ctx, 24000, 1);
        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(ctx.destination);
        setIsDjAnnouncing(true);
        window.dispatchEvent(new CustomEvent('radio_volume_change', { detail: { level: 0.1 } }));
        source.onended = () => {
          setIsDjAnnouncing(false);
          window.dispatchEvent(new CustomEvent('radio_volume_change', { detail: { level: 0.8 } }));
        };
        source.start(0);
      } else {
        setIsDjThinking(false);
      }
    } catch (e) {
      setIsDjThinking(false);
      setIsDjAnnouncing(false);
      window.dispatchEvent(new CustomEvent('radio_volume_change', { detail: { level: 0.8 } }));
    }
  }, [isPlaying, isDjAnnouncing, isDjThinking, initAudio]);

  useEffect(() => {
    const handleManualJingle = () => triggerAnnouncement('jingle', true);
    window.addEventListener('trigger_jingle_manual', handleManualJingle);
    return () => window.removeEventListener('trigger_jingle_manual', handleManualJingle);
  }, [triggerAnnouncement]);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      const mins = now.getMinutes();
      const hours = now.getHours();

      if (lastAnnouncedMinute.current === mins) return;
      lastAnnouncedMinute.current = mins;

      // 1. EVENTO ESPECIAL (Cada 2 horas, minuto 10)
      // Ejemplo: 8:10, 10:10, 12:10, 14:10...
      if (mins === 10 && hours % 2 === 0) {
        console.log('⏰ Triggering Event Spot (2-hour interval)');
        // Usamos el primer jingle de la lista que es el del evento
        triggerAnnouncement('jingle', true, DEFAULT_JINGLES[0]);
        return;
      }

      // 2. HORAA (Minuto 0 y 30)
      if (mins === 0 || mins === 30) {
        triggerAnnouncement('hourly');
      }
      // 3. JINGLES NORMALES (Minuto 15 y 45)
      else if (mins === 15 || mins === 45) {
        triggerAnnouncement('jingle');
      }
    }, 15000);
    return () => clearInterval(timer);
  }, [triggerAnnouncement]);

  const isImmersive = activeTab === NavTab.SHORTS;

  return (
    <div className="min-h-screen lg:flex bg-[#05080f] text-slate-200 overflow-hidden">
      {(isDjAnnouncing || isDjThinking) && (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[1000] animate-bounce w-[90%] md:w-auto">
          <div className={`${isDjThinking ? 'bg-blue-600 shadow-blue-500/40' : 'bg-[#a3cf33] shadow-[#a3cf33]/40'} text-slate-900 px-8 py-3 rounded-full font-black text-[10px] uppercase tracking-widest shadow-[0_0_30px_rgba(0,0,0,0.5)] flex items-center justify-center gap-3 border-2 border-white/20`}>
            <span className={`w-3 h-3 ${isDjThinking ? 'bg-white animate-spin' : 'bg-red-600 animate-pulse'} rounded-full`}></span>
            {isDjThinking ? 'SINTONIZANDO DJ AI...' : 'DJ 5:40 AL AIRE'}
          </div>
        </div>
      )}

      <aside className="hidden lg:flex flex-col w-72 h-screen fixed left-0 top-0 bg-[#0a0f1a] border-r border-white/5 p-8 z-50 overflow-y-auto no-scrollbar">
        <div className="mb-10 cursor-pointer" onClick={() => setActiveTab(NavTab.HOME)}>
          <Logo className="w-full" />
        </div>
        <nav className="flex-1 space-y-2">
          <NavItem icon="fa-home" label="Radio en Vivo" color="#a3cf33" active={activeTab === NavTab.HOME} onClick={() => setActiveTab(NavTab.HOME)} />
          <NavItem icon="fa-bolt" label="Publicidad" color="#FFD700" active={activeTab === NavTab.SHORTS} onClick={() => setActiveTab(NavTab.SHORTS)} />
          <NavItem icon="fa-music" label="Música MP3" color="#E0E0E0" active={activeTab === NavTab.MUSIC} onClick={() => setActiveTab(NavTab.MUSIC)} />
          <NavItem icon="fa-star" label="Votaciones" color="#FF9800" active={activeTab === NavTab.POLLS} onClick={() => setActiveTab(NavTab.POLLS)} />
          <NavItem icon="fa-video" label="5:40 TV" color="#FF5252" active={activeTab === NavTab.VIDEOS} onClick={() => setActiveTab(NavTab.VIDEOS)} />
          <NavItem icon="fa-calendar-alt" label="Agenda" color="#E040FB" active={activeTab === NavTab.EVENTS} onClick={() => setActiveTab(NavTab.EVENTS)} hasIndicator={hasUpcomingEvents} />
          <NavItem icon="fa-robot" label="Asistente AI" color="#00E5FF" active={activeTab === NavTab.CHAT} onClick={() => setActiveTab(NavTab.CHAT)} />
          <NavItem icon="fa-gear" label="Settings" color="#78909C" active={activeTab === NavTab.SETTINGS} onClick={() => setActiveTab(NavTab.SETTINGS)} />
        </nav>
      </aside>

      <main className={`flex-1 transition-all duration-500 overflow-y-auto h-screen no-scrollbar lg:ml-72 ${activeTab === NavTab.SHORTS ? 'p-0' : 'p-4 md:p-8'} ${activeTab === NavTab.HOME || activeTab === NavTab.VIDEOS ? 'pb-48' : 'pb-32'}`}>
        <div className={`mx-auto w-full ${activeTab === NavTab.SHORTS ? 'max-w-none' : 'max-w-screen-xl'}`}>
          {activeTab !== NavTab.SHORTS && (
            <div className="lg:hidden flex items-center justify-between mb-6 glass-dark px-5 py-4 rounded-[2rem] sticky top-2 z-40 border border-white/10 gap-4">
              <div className="flex-1 flex justify-center">
                <Logo className="w-28" />
              </div>

              {/* Acceso discreto al Plan Maestro (Settings) */}
              <button
                onClick={() => setActiveTab(NavTab.SETTINGS)}
                className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${activeTab === NavTab.SETTINGS ? 'bg-[#78909C] text-white shadow-lg' : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}
              >
                <i className="fa-solid fa-gear text-lg"></i>
              </button>
            </div>
          )}

          {/* Desktop Status Indicator (OCULTO A PETICIÓN) */}
          {/* 
          <div className="hidden lg:block fixed top-4 right-4 z-50">
            <div className="glass-dark px-3 py-1.5 rounded-xl flex flex-col items-end gap-1 border border-white/10 min-w-[120px]">
              <div className="flex items-center gap-2">
                <span className="text-[9px] uppercase font-bold text-slate-400 tracking-widest">{connectionStatus === 'SUBSCRIBED' ? 'ONLINE' : connectionStatus.replace('_', ' ')}</span>
                <div
                  className={`w-2 h-2 rounded-full cursor-pointer ${connectionStatus === 'SUBSCRIBED' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : connectionStatus === 'LOCAL_MODE' ? 'bg-yellow-500 shadow-[0_0_10px_#eab308]' : 'bg-red-500/50 animate-pulse'} transition-all`}
                  title="Click para reintentar conexión"
                  onClick={() => {
                    import('./services/supabase').then(m => m.forceReconnect());
                  }}
                ></div>
              </div>
              {connectionDetails && (
                <div className="text-[8px] text-red-500/70 font-mono text-right max-w-[200px] break-words">
                  {connectionDetails}
                </div>
              )}
            </div>
          </div>
          */}

          {activeTab === NavTab.HOME && <HomeView onPlayToggle={() => setIsPlaying(!isPlaying)} isPlaying={isPlaying} />}

          <ErrorBoundary>
            <Suspense fallback={
              <div className="flex items-center justify-center min-h-[60vh]">
                <div className="text-center space-y-4">
                  <div className="relative w-16 h-16 mx-auto">
                    <div className="absolute inset-0 border-4 border-[#a3cf33]/20 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-[#a3cf33] rounded-full border-t-transparent animate-spin"></div>
                  </div>
                  <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">🎵 Cargando...</p>
                </div>
              </div>
            }>
              {activeTab === NavTab.VIDEOS && <VideoView />}
              {activeTab === NavTab.SHORTS && <ShortsView />}
              {activeTab === NavTab.EVENTS && <EventsView />}
              {activeTab === NavTab.CHAT && <ChatAssistant />}
              {activeTab === NavTab.MUSIC && <MusicLibraryView />}
              {activeTab === NavTab.POLLS && <PollsView />}
              {activeTab === NavTab.GREETINGS && <LiveGreetingsView />}
              {activeTab === NavTab.SETTINGS && <SettingsView />}
            </Suspense>
          </ErrorBoundary>
        </div>
      </main >

      <nav className="fixed bottom-4 left-4 right-4 h-16 glass-dark rounded-full px-2 flex justify-between items-center z-[200] border border-white/10 lg:hidden backdrop-blur-3xl">
        {/* Izquierda del centro - 3 botones */}
        <div className="flex items-center gap-1">
          <MobileIcon icon="fa-house" color="#a3cf33" active={activeTab === NavTab.HOME} onClick={() => setActiveTab(NavTab.HOME)} />
          <MobileIcon icon="fa-bolt" color="#FFD700" active={activeTab === NavTab.SHORTS} onClick={() => setActiveTab(NavTab.SHORTS)} />
          <MobileIcon icon="fa-video" color="#FF5252" active={activeTab === NavTab.VIDEOS} onClick={() => setActiveTab(NavTab.VIDEOS)} />
        </div>

        {/* Botón central elevado - Chat AI */}
        <button
          onClick={() => setActiveTab(NavTab.CHAT)}
          className={`absolute left-1/2 -translate-x-1/2 -top-10 w-16 h-16 rounded-full flex items-center justify-center transition-all shadow-lg ${activeTab === NavTab.CHAT ? 'bg-[#a3cf33] scale-110' : 'bg-[#a3cf33]/90'}`}
          style={{ boxShadow: '0 4px 20px rgba(163, 207, 51, 0.4)' }}
        >
          <i className="fa-solid fa-robot text-2xl text-slate-900"></i>
        </button>

        {/* Derecha del centro - 3 botones */}
        <div className="flex items-center gap-1">
          <MobileIcon icon="fa-music" color="#E0E0E0" active={activeTab === NavTab.MUSIC} onClick={() => setActiveTab(NavTab.MUSIC)} />
          <MobileIcon icon="fa-star" color="#FF9800" active={activeTab === NavTab.POLLS} onClick={() => setActiveTab(NavTab.POLLS)} />
          <MobileIcon icon="fa-calendar-alt" color="#E040FB" active={activeTab === NavTab.EVENTS} onClick={() => setActiveTab(NavTab.EVENTS)} hasIndicator={hasUpcomingEvents} />
        </div>
      </nav>

      <div className={`transition-all duration-500 ${isImmersive ? 'opacity-0 translate-y-full' : 'opacity-100 translate-y-0'}`}>
        <PlayerBar isPlaying={isPlaying} onPlayToggle={() => setIsPlaying(!isPlaying)} />
      </div>
    </div >
  );
};

// --- NAVIGATION COMPONENTS ---
const NavItem: React.FC<NavItemProps> = ({ icon, label, color, active, onClick, hasIndicator }) => (
  <button onClick={onClick} className={`w-full relative flex items-center gap-4 px-6 py-4 rounded-2xl transition-all group ${active ? 'bg-white/10 text-white font-black' : 'text-slate-400 hover:bg-white/5'}`}>
    <div className={`flex items-center justify-center w-8 h-8 rounded-lg transition-all ${active ? 'scale-110' : 'group-hover:scale-110'}`} style={{ color: active ? color : '#94a3b8' }}>
      <i className={`${icon === 'fa-spotify' ? 'fa-brands fa-spotify' : 'fa-solid ' + icon} text-lg`}></i>
    </div>
    <span className={`text-[10px] uppercase font-bold tracking-widest ${active ? 'text-white' : 'text-slate-500'}`}>{label}</span>
    {active && <div className="absolute left-0 w-1 h-6 rounded-full" style={{ backgroundColor: color }}></div>}
    {hasIndicator && <span className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full animate-pulse"></span>}
  </button>
);

const MobileIcon: React.FC<MobileIconProps> = ({ icon, color, active, onClick, hasIndicator }) => (
  <button onClick={onClick} className={`p-3 relative flex flex-col items-center justify-center`}>
    <div className={`transition-all ${active ? 'scale-125' : 'scale-100 opacity-50'}`} style={{ color: active ? color : '#ffffff' }}>
      <i className={`${icon === 'fa-spotify' ? 'fa-brands fa-spotify' : 'fa-solid ' + icon} text-xl`}></i>
    </div>
    {hasIndicator && <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full animate-pulse border border-slate-900"></span>}
  </button>
);

export default App;
