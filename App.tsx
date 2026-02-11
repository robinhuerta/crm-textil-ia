
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
import { DEFAULT_HOURLY_SCRIPTS, DEFAULT_JINGLES, MOCK_EVENTS, RADIO_STREAM_URL } from './constants';
import { decodeAudioData } from './utils/audioUtils';
import { subscribeToRadioEvents, onRadioConnectionChange } from './services/supabase';
import { generateGeminiSpeech, decodeGeminiAudio, playGeminiAudio } from './services/geminiTTSService';

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
  const [connectionStatus, setConnectionStatus] = useState<string>('connecting');
  const [connectionDetails, setConnectionDetails] = useState<string>('');
  const lastAnnouncedMinute = useRef<number>(-1);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const initAudio = useCallback(async () => {
    if (!audioCtxRef.current) {
      audioCtxRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({ sampleRate: 24000 });
    }
    if (audioCtxRef.current.state === 'suspended') {
      await audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  }, []);



  // Inicialización: Forzar señal principal al abrir la app
  useEffect(() => {
    localStorage.setItem('radio_stream_url_active', RADIO_STREAM_URL);
    window.dispatchEvent(new Event('radio_url_changed'));
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

  // Escuchar saludos en vivo (Global Broadcast)
  useEffect(() => {
    const handleGreeting = async (greeting: any) => {
      console.log('🗣️ Reproduciendo saludo:', greeting);

      // Feedback visual para el usuario (Overlay DJ AI)
      setIsDjThinking(true);

      // Construir texto (misma lógica que en la vista, idealmente centralizar)
      const greetingText = greeting.message
        ? `¡Tenemos un saludo! Para ${greeting.to}, de parte de ${greeting.from}. ${greeting.message}. ¡Un abrazo grande!`
        : `¡Tenemos un saludo! Para ${greeting.to}, de parte de ${greeting.from}. ¡Un abrazo grande!`;

      try {
        // 1. Generar audio
        const base64Audio = await generateGeminiSpeech(greetingText, 'Kore');
        if (!base64Audio) {
          setIsDjThinking(false);
          return;
        }

        // 2. Inicializar contexto si es necesario
        const ctx = await initAudio();
        if (!ctx) {
          setIsDjThinking(false);
          return;
        }

        // 3. Decodificar
        const buffer = await decodeGeminiAudio(base64Audio, ctx);
        if (!buffer) {
          setIsDjThinking(false);
          return;
        }

        // 4. Reproducir (con ducking automático incluido en playGeminiAudio)
        setIsDjThinking(false);
        setIsDjAnnouncing(true); // Mostrar "AL AIRE"

        playGeminiAudio(
          buffer,
          ctx,
          undefined, // onStart
          () => {    // onEnd
            setIsDjAnnouncing(false);
          }
        );

      } catch (err) {
        console.error('Error playing greeting:', err);
        setIsDjThinking(false);
        setIsDjAnnouncing(false);
      }
    };

    const unsubscribe = subscribeToRadioEvents(handleGreeting);
    const unsubscribeStatus = onRadioConnectionChange((status, details) => {
      setConnectionStatus(status);
      setConnectionDetails(details || '');
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



  const triggerAnnouncement = useCallback(async (type: 'hourly' | 'jingle', force = false) => {
    if (!isPlaying && !force) return;
    if (isDjAnnouncing || isDjThinking) return;

    setIsDjThinking(true);

    const performRequest = async (): Promise<string | undefined> => {
      const apiKey = process.env.API_KEY;
      if (!apiKey) return undefined;
      const ai = new GoogleGenAI({ apiKey });
      const now = new Date();
      const horaStr = now.toLocaleTimeString('es-PE', { hour: 'numeric', minute: '2-digit', hour12: true });
      let baseText = "";
      if (type === 'hourly') {
        const scripts = JSON.parse(localStorage.getItem('radio_hourly_scripts') || JSON.stringify(DEFAULT_HOURLY_SCRIPTS));
        baseText = scripts[Math.floor(Math.random() * scripts.length)].replace("{hora}", horaStr);
      } else {
        const jingles = JSON.parse(localStorage.getItem('radio_jingles') || JSON.stringify(DEFAULT_JINGLES));
        baseText = jingles[Math.floor(Math.random() * jingles.length)];
      }
      const fullPrompt = `Actúa como locutor carismático de la radio peruana 'La Nueva 5:40'. Con mucha energía y sabor, di: ${baseText}`;
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
      if (lastAnnouncedMinute.current === mins) return;
      lastAnnouncedMinute.current = mins;
      if (mins === 0 || mins === 30) triggerAnnouncement('hourly');
      else if (mins === 15 || mins === 45) triggerAnnouncement('jingle');
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

      <main className={`flex-1 transition-all duration-500 overflow-y-auto h-screen no-scrollbar ${activeTab === NavTab.SHORTS ? 'p-0' : 'p-4 md:p-8 lg:ml-72'} ${activeTab === NavTab.HOME || activeTab === NavTab.VIDEOS ? 'pb-48' : 'pb-32'}`}>
        <div className={`mx-auto w-full ${activeTab === NavTab.SHORTS ? 'max-w-none' : 'max-w-screen-xl'}`}>
          {activeTab !== NavTab.SHORTS && (
            <div className="lg:hidden flex items-center justify-center mb-6 glass-dark px-5 py-4 rounded-[2rem] sticky top-2 z-40 border border-white/10">
              <Logo className="w-28" />
              <div className="absolute right-4 flex items-center gap-2">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] uppercase font-bold text-slate-500 hidden sm:block">{connectionStatus === 'SUBSCRIBED' ? 'ONLINE' : connectionStatus.replace('_', ' ')}</span>
                  {connectionDetails && <span className="text-[8px] text-red-500 font-medium max-w-[100px] truncate">{connectionDetails}</span>}
                </div>
                <div
                  className={`w-3 h-3 rounded-full cursor-pointer ${connectionStatus === 'SUBSCRIBED' ? 'bg-green-500 shadow-[0_0_10px_#22c55e]' : connectionStatus === 'LOCAL_MODE' ? 'bg-yellow-500 shadow-[0_0_10px_#eab308]' : 'bg-red-500/50 animate-pulse'} transition-all`}
                  title={`Estado: ${connectionStatus} ${connectionDetails}`}
                  onClick={() => {
                    import('./services/supabase').then(m => m.forceReconnect());
                  }}
                ></div>
              </div>
            </div>
          )}

          {/* Desktop Status Indicator */}
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

          {activeTab === NavTab.HOME && <HomeView onPlayToggle={() => setIsPlaying(!isPlaying)} isPlaying={isPlaying} />}

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
        </div>
      </main>

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
          <MobileIcon icon="fa-gear" color="#78909C" active={activeTab === NavTab.SETTINGS} onClick={() => setActiveTab(NavTab.SETTINGS)} />
        </div>
      </nav>

      <div className={`transition-all duration-500 ${isImmersive ? 'opacity-0 translate-y-full' : 'opacity-100 translate-y-0'}`}>
        <PlayerBar isPlaying={isPlaying} onPlayToggle={() => setIsPlaying(!isPlaying)} />
      </div>
    </div>
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
