import React, { useState, useEffect, useRef, useCallback } from 'react';
import { LiveGreeting } from '../types';
import { GREETINGS_WHATSAPP, ADMIN_PASSWORD, STARTUP_COMMERCIAL_TEXT } from '../constants';
import { generateGeminiSpeech, decodeGeminiAudio, playGeminiAudio } from '../services/geminiTTSService';
import { broadcastGreeting, onRadioConnectionChange, supabase, supabaseAnonKey, uploadVoiceGreeting } from '../services/supabase';
import { professionalizeGreeting } from '../services/geminiService';

// Limpia texto de usuario: elimina HTML, caracteres peligrosos y limita longitud
const sanitizeInput = (text: string, maxLen = 200): string =>
    text.replace(/<[^>]*>/g, '').replace(/[<>&"'`]/g, '').trim().slice(0, maxLen);

const LiveGreetingsView: React.FC = () => {
    const [greetings, setGreetings] = useState<LiveGreeting[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ from: '', to: '', message: '' });
    const [activeGreeting, setActiveGreeting] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [connectionStatus, setConnectionStatus] = useState('connecting');
    const [connectionDetails, setConnectionDetails] = useState('');
    const [isEnhancing, setIsEnhancing] = useState(false); // IA mejorando el mensaje
    const [enhancedPreview, setEnhancedPreview] = useState<string | null>(null); // Preview del mensaje mejorado
    const [isPreviewingText, setIsPreviewingText] = useState(false); // Estamos en modo preview
    const [previewFormData, setPreviewFormData] = useState({ from: '', to: '', message: '' }); // Datos originales guardados
    const [isPlayingPreview, setIsPlayingPreview] = useState(false); // Reproduciendo preview TTS

    const audioCtxRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    // Voice Recording State
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [showVoiceRecorder, setShowVoiceRecorder] = useState(false);
    const [voiceFromName, setVoiceFromName] = useState('');
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
    const audioChunksRef = useRef<Blob[]>([]);
    const MAX_RECORDING_SECONDS = 60; // Máximo 1 minuto


    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState(false);

    const checkAuth = () => {
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            setAuthError(false);
        } else {
            setAuthError(true);
        }
    };

    // Check for existing session or settings unlock
    useEffect(() => {
        const sessionAuth = localStorage.getItem('admin_authenticated');
        const settingsUnlocked = localStorage.getItem('settings_unlocked');

        if (sessionAuth === 'true' || settingsUnlocked === 'true') {
            setIsAuthenticated(true);
        }
    }, []);


    useEffect(() => {
        const saved = localStorage.getItem('radio_greetings');
        if (saved) {
            setGreetings(JSON.parse(saved));
        }
    }, []);



    useEffect(() => {
        const unsubscribe = onRadioConnectionChange((status, details) => {
            setConnectionStatus(status);
            setConnectionDetails(details || '');
        });
        return () => unsubscribe();
    }, []);



    useEffect(() => {
        if (greetings.length > 0) {
            localStorage.setItem('radio_greetings', JSON.stringify(greetings));
        }
    }, [greetings]);

    // --- VOICE RECORDING FUNCTIONS ---
    const startRecording = useCallback(async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    sampleRate: 44100
                }
            });

            // Detectar formatos soportados
            const mimeType = MediaRecorder.isTypeSupported('audio/webm;codecs=opus')
                ? 'audio/webm;codecs=opus'
                : MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')
                    ? 'audio/ogg;codecs=opus'
                    : 'audio/webm';

            const recorder = new MediaRecorder(stream, { mimeType });
            mediaRecorderRef.current = recorder;
            audioChunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    audioChunksRef.current.push(e.data);
                }
            };

            recorder.onstop = () => {
                const blob = new Blob(audioChunksRef.current, { type: mimeType });
                setRecordedBlob(blob);
                // Detener todas las pistas del micrófono
                stream.getTracks().forEach(track => track.stop());
            };

            recorder.start(250); // Recoger datos cada 250ms
            setIsRecording(true);
            setRecordingTime(0);
            setRecordedBlob(null);

            // Timer visual
            recordingTimerRef.current = setInterval(() => {
                setRecordingTime(prev => {
                    if (prev >= MAX_RECORDING_SECONDS - 1) {
                        stopRecording();
                        return MAX_RECORDING_SECONDS;
                    }
                    return prev + 1;
                });
            }, 1000);

        } catch (err: any) {
            console.error('Error accediendo al micrófono:', err);
            alert('❌ No se pudo acceder al micrófono.\n\nAsegúrate de dar permiso al navegador y que tu dispositivo tenga micrófono.');
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
        }
        if (recordingTimerRef.current) {
            clearInterval(recordingTimerRef.current);
            recordingTimerRef.current = null;
        }
        setIsRecording(false);
    }, []);

    const cancelRecording = useCallback(() => {
        stopRecording();
        setRecordedBlob(null);
        setRecordingTime(0);
        setShowVoiceRecorder(false);
        setVoiceFromName('');
    }, [stopRecording]);

    const sendVoiceGreeting = useCallback(async () => {
        if (!recordedBlob) return;
        if (!voiceFromName.trim()) {
            alert('Por favor escribe tu nombre ("De parte de..")');
            return;
        }

        setIsUploading(true);
        const greetingId = Date.now().toString();

        try {
            // 1. Subir audio a Supabase Storage
            const audioUrl = await uploadVoiceGreeting(recordedBlob, greetingId);

            if (!audioUrl) {
                throw new Error('No se pudo subir el archivo de audio a Supabase.');
            }

            // 2. Crear el saludo con la URL
            const newGreeting: LiveGreeting = {
                id: greetingId,
                from: voiceFromName.trim(),
                to: 'Todos los oyentes',
                message: `🎤 Saludo de voz (${recordingTime}s)`,
                audio_url: audioUrl,
                status: 'pending',
                timestamp: new Date().toISOString()
            };

            // 3. Reproducir localmente INMEDIATAMENTE con el Blob (más fiable para el emisor)
            const localUrl = URL.createObjectURL(recordedBlob);
            playVoiceAudioLocally(localUrl, greetingId, true); // true = es local

            // 4. Broadcast a todos los oyentes
            const broadcastResult = await broadcastGreeting(newGreeting);

            if (broadcastResult.success) {
                console.log('[VOICE] Saludo de voz enviado OK');
                setGreetings(prev => [newGreeting, ...prev]);
            } else {
                console.warn('[VOICE] Supabase fallo directo, usando proxy...');
                const proxyResult = await proxyBroadcast(newGreeting);
                if (proxyResult) {
                    setGreetings(prev => [newGreeting, ...prev]);
                } else {
                    alert('⚠️ El saludo se grabó pero parece que hay problemas de conexión para enviarlo a los demás.');
                }
            }

            // 5. Limpiar UI
            setRecordedBlob(null);
            setRecordingTime(0);
            setShowVoiceRecorder(false);
            setVoiceFromName('');

        } catch (e: any) {
            console.error('Error enviando saludo de voz:', e);
            alert(`❌ Error: ${e.message || 'No se pudo enviar el saludo'}. Verifica tu conexión.`);
        } finally {
            setIsUploading(false);
        }
    }, [recordedBlob, voiceFromName, recordingTime]);

    // Reproducir audio de voz
    const playVoiceAudioLocally = async (url: string, greetingId: string, isLocal: boolean = false) => {
        setActiveGreeting(greetingId);
        setIsGenerating(false);

        console.log(`[AUDIO] Iniciando reproducción ${isLocal ? 'LOCAL (Blob)' : 'REMOTA (URL)'}`);

        // Ducking: bajar volumen de la radio
        window.dispatchEvent(new CustomEvent('radio_volume_change', { detail: { level: 0.1 } }));

        const audio = new Audio(url);
        audio.crossOrigin = 'anonymous';

        const cleanup = () => {
            setActiveGreeting(null);
            window.dispatchEvent(new CustomEvent('radio_volume_change', { detail: { level: 0.8 } }));
            if (isLocal) URL.revokeObjectURL(url);
        };

        audio.onended = () => {
            console.log('[AUDIO] Fin de reproducción ok');
            setGreetings(prev => prev.map(g => g.id === greetingId ? { ...g, status: 'completed' } : g));
            cleanup();
        };

        audio.onerror = (e) => {
            console.error('[AUDIO] Error en elemento audio:', e);
            cleanup();
        };

        try {
            await audio.play();
        } catch (err) {
            console.error('[AUDIO] Play falló (posible bloqueo de navegador):', err);
            cleanup();
            // Si falló el local y no es interactivo, avisar
            if (isLocal) alert('El navegador bloqueó la reproducción. Haz clic en la página para permitir audio.');
        }
    };

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);



    // Error State para UI Avanzado
    const [sendError, setSendError] = useState<{ msg: string, greeting: LiveGreeting } | null>(null);

    // Estado para notificaciones de transmisión
    const [broadcastStatus, setBroadcastStatus] = useState<'sending' | 'success' | 'local_only' | null>(null);

    // Función de respaldo robusta: TTS Nativo del Navegador (Funciona Offline al 100%)
    const speakNative = (text: string) => {
        return new Promise<void>((resolve) => {
            if (!window.speechSynthesis) {
                console.error('Navegador no soporta TTS nativo');
                resolve();
                return;
            }

            // Cancelar cualquier lectura anterior
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.lang = 'es-ES'; // Español
            utterance.rate = 1.1; // Un poco más rápido
            utterance.pitch = 1.0;
            utterance.volume = 1.0;

            // Intentar buscar una voz en español
            const voices = window.speechSynthesis.getVoices();
            const spanishVoice = voices.find(v => v.lang.includes('es')) || voices[0];
            if (spanishVoice) utterance.voice = spanishVoice;

            utterance.onend = () => resolve();
            utterance.onerror = (e) => {
                console.error('Error nativo TTS:', e);
                resolve();
            };

            window.speechSynthesis.speak(utterance);
        });
    };

    // Función para reproducir localmente (Modo Offline / Forzado)
    const playGreetingLocally = async (greeting: LiveGreeting) => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        if (audioCtxRef.current.state === 'suspended') {
            await audioCtxRef.current.resume();
        }

        setSendError(null);
        setIsGenerating(true);
        setActiveGreeting(greeting.id);

        const greetingText = greeting.message || `Saludo para ${greeting.to}, de parte de ${greeting.from}. Un abrazo grande`;

        try {
            // Intentar Gemini AI (Voz Premium)
            const base64Audio = await generateGeminiSpeech(greetingText, 'Kore');

            if (base64Audio && audioCtxRef.current) {
                const buffer = await decodeGeminiAudio(base64Audio, audioCtxRef.current);
                if (buffer) {
                    playGeminiAudio(buffer, audioCtxRef.current, undefined, () => {
                        setActiveGreeting(null);
                        setIsGenerating(false);
                        setGreetings(prev => prev.map(g => g.id === greeting.id ? { ...g, status: 'completed' } : g));
                        // status logged // Clear status after local playback
                    });
                    return; // Éxito con Gemini
                }
            }

            throw new Error('Fallo generación Gemini');

        } catch (e) {
            console.warn('⚠️ Falló Gemini TTS, usando Voz Nativa...', e);
            // FALLBACK ULTIMATE: Voz del Navegador
            await speakNative(greetingText);

            setActiveGreeting(null);
            setIsGenerating(false);
            setGreetings(prev => prev.map(g => g.id === greeting.id ? { ...g, status: 'completed' } : g));
            // status logged // Clear status after local playback
        }
    };

    // PASO 1: Mejorar el mensaje con IA y mostrar preview
    const enhanceGreeting = async () => {
        const cleanFrom = sanitizeInput(formData.from, 80);
        const cleanTo = sanitizeInput(formData.to, 80);
        const cleanMsg = sanitizeInput(formData.message, 300);

        if (!cleanFrom || !cleanTo) {
            alert('Por favor completa "De" y "Para"');
            return;
        }

        setIsEnhancing(true);
        setPreviewFormData({ from: cleanFrom, to: cleanTo, message: cleanMsg });

        const enhancedMessage = await professionalizeGreeting(
            cleanFrom,
            cleanTo,
            cleanMsg || undefined
        );

        setIsEnhancing(false);
        setEnhancedPreview(enhancedMessage);
        setIsPreviewingText(true);
        setShowForm(false);
    };

    // Preview: Escuchar el mensaje mejorado con TTS
    const previewEnhancedAudio = async () => {
        if (!enhancedPreview) return;
        setIsPlayingPreview(true);
        try {
            if (!audioCtxRef.current) {
                audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
            }
            if (audioCtxRef.current.state === 'suspended') await audioCtxRef.current.resume();

            const base64Audio = await generateGeminiSpeech(enhancedPreview, 'Kore');
            if (base64Audio && audioCtxRef.current) {
                const buffer = await decodeGeminiAudio(base64Audio, audioCtxRef.current);
                if (buffer) {
                    playGeminiAudio(buffer, audioCtxRef.current, undefined, () => {
                        setIsPlayingPreview(false);
                    });
                    return;
                }
            }
            throw new Error('TTS failed');
        } catch (e) {
            console.warn('Preview TTS falló, usando voz nativa');
            const utterance = new SpeechSynthesisUtterance(enhancedPreview);
            utterance.lang = 'es-MX';
            utterance.onend = () => setIsPlayingPreview(false);
            utterance.onerror = () => setIsPlayingPreview(false);
            window.speechSynthesis.speak(utterance);
        }
    };

    // Preview: Re-generar con IA
    const reEnhanceGreeting = async () => {
        setIsEnhancing(true);
        const enhancedMessage = await professionalizeGreeting(
            previewFormData.from.trim(),
            previewFormData.to.trim(),
            previewFormData.message.trim() || undefined
        );
        setIsEnhancing(false);
        setEnhancedPreview(enhancedMessage);
    };

    // Preview: Cancelar
    const cancelPreview = () => {
        setIsPreviewingText(false);
        setEnhancedPreview(null);
        setShowForm(true);
        window.speechSynthesis.cancel();
        setIsPlayingPreview(false);
    };

    // PASO 2: Enviar el mensaje mejorado
    const sendEnhancedGreeting = async () => {
        if (!enhancedPreview) return;
        window.speechSynthesis.cancel();
        setIsPlayingPreview(false);

        const greetingTimestamp = new Date().toISOString();
        const newGreeting: LiveGreeting = {
            id: Date.now().toString(),
            from: previewFormData.from.trim(),
            to: previewFormData.to.trim(),
            message: enhancedPreview,
            status: 'pending',
            timestamp: greetingTimestamp
        };

        setGreetings([newGreeting, ...greetings]);
        setFormData({ from: '', to: '', message: '' });
        setIsPreviewingText(false);
        setEnhancedPreview(null);

        // Marcar como reproducido localmente (evitar eco) - usar timestamp que Supabase preserva
        if (!(window as any)._locallyPlayedIds) (window as any)._locallyPlayedIds = new Set();
        (window as any)._locallyPlayedIds.add(greetingTimestamp);
        setTimeout(() => (window as any)._locallyPlayedIds?.delete(greetingTimestamp), 15000);

        playGreetingLocally(newGreeting);

        broadcastGreeting(newGreeting).then(result => {
            if (result.success) {
                console.log('[BROADCAST] Saludo mejorado enviado a Supabase OK');
            } else {
                proxyBroadcast(newGreeting).then(() => { });
            }
        }).catch(() => { });
    };

    // Función de TRANSMISIÓN VÍA NETLIFY SERVERLESS FUNCTION (La solución definitiva)
    const proxyBroadcast = async (greeting: LiveGreeting): Promise<{ success: boolean; error?: string }> => {
        try {
            const endpoint = window.location.origin + '/.netlify/functions/broadcast';
            console.log('🚀 Iniciando transmisión a:', endpoint);

            const dbPayload: any = {
                from_name: greeting.from || 'Anónimo',
                to_name: greeting.to || 'Todos',
                message: greeting.message || '',
                created_at: greeting.timestamp || new Date().toISOString(),
                is_played: false
            };

            // Incluir audio_url si existe (saludos de voz)
            if (greeting.audio_url) {
                dbPayload.audio_url = greeting.audio_url;
            }

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(dbPayload)
            });

            if (!response.ok) {
                const text = await response.text();
                throw new Error(`Server responded with ${response.status}: ${text}`);
            }

            const data = await response.json();

            if (data.success) {
                console.log('✅ TRANSMISIÓN EXITOSA (Netlify Function)');
                return { success: true };
            } else {
                console.error('❌ Error en Netlify Function:', data);
                return { success: false, error: data.error || 'Error desconocido en la función' };
            }

        } catch (e: any) {
            console.error('❌ Error de Red al conectar con Netlify Function:', e);
            return { success: false, error: e.message || 'Error de conexión (Fetch Failed)' };
        }
    };

    // DIAGNÓSTICO DE CONEXIÓN
    const runDiagnostics = async () => {
        const endpoint = window.location.origin + '/.netlify/functions/broadcast';
        alert(`🕵️‍♂️ INICIANDO DIAGNÓSTICO\n\nDestino: ${endpoint}\n\n1. Probando alcance (GET)...`);

        try {
            // Prueba 1: GET (Debe dar 405 Method Not Allowed, lo cual es ÉXITO de conexión)
            const resGet = await fetch(endpoint);
            if (resGet.status === 405) {
                const txt = await resGet.text();
                alert(`✅ PASO 1 ÉXITO: El servidor respondió (405 Correcto).\n\nMensaje: "${txt}"\n\nContinuando con prueba POST...`);
            } else {
                alert(`⚠️ PASO 1 EXTRAÑO: Respondio status ${resGet.status} (Esperaba 405). ¿Existe la función?`);
            }

            // Prueba 2: POST (Simulacro)
            const resPost = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ from_name: 'Diagnostico', to_name: 'Test', message: 'Ping', created_at: new Date().toISOString(), is_played: true })
            });

            if (resPost.ok) {
                const data = await resPost.json();
                alert(`🎉 DIAGNÓSTICO COMPLETADO: ¡CONEXIÓN TOTAL!\n\n Respuesta: ${JSON.stringify(data)}`);
            } else {
                const errTxt = await resPost.text();
                alert(`❌ PASO 2 FALLÓ: El servidor rechazó el POST.\nStatus: ${resPost.status}\nError: ${errTxt}`);
            }

        } catch (e: any) {
            alert(`☠️ ERROR CRÍTICO DE RED\n\nEl navegador no pudo ni siquiera contactar al servidor.\n\nCausa: ${e.message}\n\nPosibles razones:\n- Bloqueador de anuncios (AdBlock)\n- Restricción de red corporativa\n- Problema SSL/HTTPS local`);
        }
    };

    const readGreeting = async (greeting: LiveGreeting) => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        if (audioCtxRef.current.state === 'suspended') {
            await audioCtxRef.current.resume();
        }

        setSendError(null);
        // status logged // Iniciando transmisión
        setIsGenerating(true);
        setActiveGreeting(greeting.id);

        try {
            // INTENTO 1: Transmitir DIRECTO (Standard)
            const result = await broadcastGreeting(greeting);

            if (result.success) {
                // Éxito directo
                if (connectionStatus !== 'SUBSCRIBED') {
                    console.log('⚠️ Enviado a DB (HTTP OK), pero ecos WS bloqueados. Reproduciendo manual...');
                    // status logged
                    await playGreetingLocally(greeting);
                } else {
                    // status logged
                    // Esperar confirmación visual (simulada por ahora)
                    setGreetings(greetings.map(g => g.id === greeting.id ? { ...g, status: 'reading' } : g));
                    setTimeout(() => {
                        setGreetings(greetings.map(g => g.id === greeting.id ? { ...g, status: 'completed' } : g));
                        setActiveGreeting(null);
                        setIsGenerating(false);
                        // status logged
                    }, 10000); // 10s de "al aire"
                }
            } else {
                // FALLO INTENTO 1: Red Bloqueada
                console.warn('⚠️ Fallo Directo. INICIANDO PROTOCOLO BYPASS (NETLIFY PROXY)...');

                // INTENTO 2: BYPASS (Túnel)
                const bypassResult = await proxyBroadcast(greeting);

                if (bypassResult.success) {
                    // status logged // ¡Lo logramos por el túnel!
                    await playGreetingLocally(greeting);
                } else {
                    // FALLO TOTAL
                    console.error('☠️ Fallo Total (Directo + Bypass).');
                    // status logged
                    alert(`⚠️ ERROR DE CONEXIÓN GLOBAL\n\nEl saludo se reproducirá SOLAMENTE AQUÍ.\n\nError: ${bypassResult.error}`);
                    await playGreetingLocally(greeting);
                }
            }

        } catch (e: any) {
            console.error('Error crítico en lectura:', e);
            setBroadcastStatus('local_only')
            await playGreetingLocally(greeting);
        }
    };

    // PREVIEW COMERCIAL (Auditoría)
    const previewCommercial = async () => {
        const btn = document.getElementById('btn-preview-commercial');
        if (btn) btn.innerHTML = '⏳ Generando...';

        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        if (audioCtxRef.current.state === 'suspended') await audioCtxRef.current.resume();

        try {
            const base64 = await generateGeminiSpeech(STARTUP_COMMERCIAL_TEXT, 'Kore');
            if (base64 && audioCtxRef.current) {
                const buffer = await decodeGeminiAudio(base64, audioCtxRef.current);
                if (buffer) {
                    playGeminiAudio(buffer, audioCtxRef.current);
                    if (btn) btn.innerHTML = '▶️ Reproduciendo...';
                    setTimeout(() => { if (btn) btn.innerHTML = '🔊 Auditar Comercial La Machi'; }, 15000);
                }
            }
        } catch (e) {
            alert('Error generando preview: ' + e);
            if (btn) btn.innerHTML = '❌ Error';
        }
    };

    const stopReading = () => {
        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
            audioSourceRef.current = null;
        }
        setActiveGreeting(null);
        setIsGenerating(false);
        // Restaurar volumen
        window.dispatchEvent(new CustomEvent('radio_volume_change', { detail: { level: 0.8 } }));
    };

    const rejectGreeting = (id: string) => {
        setGreetings(greetings.map(g =>
            g.id === id ? { ...g, status: 'rejected' } : g
        ));
    };

    const deleteGreeting = (id: string) => {
        setGreetings(greetings.filter(g => g.id !== id));
    };

    const pendingGreetings = greetings.filter(g => g.status === 'pending');
    const completedGreetings = greetings.filter(g => g.status === 'completed');
    const todayCompleted = completedGreetings.filter(g => {
        const greetingDate = new Date(g.timestamp).toDateString();
        const today = new Date().toDateString();
        return greetingDate === today;
    });

    return (
        <div className="space-y-8 animate-fadeIn pb-32 max-w-4xl mx-auto px-4">
            {/* PASSWORD GATE */}
            {!isAuthenticated ? (
                <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-6">
                    <div className="text-center space-y-3">
                        <i className="fa-solid fa-lock text-4xl text-[#a3cf33]/60"></i>
                        <h2 className="text-2xl font-black text-white uppercase tracking-wider">Panel de Control</h2>
                        <p className="text-slate-400 text-sm">Ingresa la contraseña para acceder</p>
                    </div>
                    <div className="flex gap-2 w-full max-w-sm">
                        <input
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && checkAuth()}
                            placeholder="Contraseña..."
                            className="flex-1 px-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white placeholder:text-slate-500 focus:outline-none focus:border-[#a3cf33]/50"
                        />
                        <button
                            onClick={checkAuth}
                            className="px-6 py-3 bg-[#a3cf33] text-black font-bold rounded-xl hover:bg-[#b5e035] transition-all"
                        >
                            Entrar
                        </button>
                    </div>
                    {authError && (
                        <p className="text-red-400 text-sm animate-pulse">❌ Contraseña incorrecta</p>
                    )}
                </div>
            ) : (
                <>
                    {/* HEADER */}
                    <header className="relative text-center space-y-6 overflow-hidden rounded-[3rem] p-8 md:p-12">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 via-[#a3cf33]/10 to-blue-600/20 animate-gradient"></div>
                        <div className="absolute inset-0 backdrop-blur-3xl"></div>

                        <div className="relative z-10">
                            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600/30 to-[#a3cf33]/30 border border-green-500/40 rounded-full text-green-200 text-xs font-black uppercase tracking-[0.3em] backdrop-blur-xl mb-4">
                                <i className="fa-solid fa-microphone-lines text-lg"></i>
                                Saludos en Vivo
                            </div>

                            <button
                                id="btn-preview-commercial"
                                onClick={previewCommercial}
                                className="mb-6 mx-auto block text-[10px] text-[#a3cf33] hover:text-white underline uppercase tracking-widest border border-[#a3cf33]/30 px-4 py-2 rounded-full hover:bg-[#a3cf33]/10 transition-all"
                            >
                                🔊 Auditar Comercial La Machi
                            </button>

                            <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
                                Saluditos <span className="bg-gradient-to-r from-[#a3cf33] to-green-400 bg-clip-text text-transparent">Al Aire</span>
                                <span className="block text-xs text-slate-600 mt-2 font-mono tracking-widest opacity-50">v7.0 (Global Broadcast)</span>
                            </h1>

                            <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-6">
                                📱 Envía tu saludo por WhatsApp y lo leeremos al aire con voz AI profesional
                            </p>

                            <a
                                href={`${GREETINGS_WHATSAPP}?text=${encodeURIComponent("¡Hola! 👋 Bienvenido a La Nueva 5:40.\n\nTu saludo ya está en cola para ser leído por nuestra IA. 🤖\n\n⚠️ Ojo: Por favor escribe solo TEXTO, no envíes audios.\n\nEscúchanos en vivo aquí: 👇\n🔗 https://radioficial540.netlify.app/")}`}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#25D366] to-[#20bd5a] text-white font-black rounded-2xl text-sm uppercase tracking-widest hover:shadow-lg hover:shadow-green-500/50 transition-all"
                            >
                                <i className="fa-brands fa-whatsapp text-2xl"></i>
                                933-067-069
                            </a>
                        </div>
                    </header>

                    {/* LOGIN REMOVED - PUBLIC ACCESS ENABLED */}
                    {/* 
            {!isAuthenticated ? (
                <div className="max-w-md mx-auto glass-dark p-8 rounded-3xl border border-white/10 text-center space-y-6">
                    ...
                </div>
            ) : ( 
            */}

                    {/* ADMIN PANEL */}

                    {/* ON AIR INDICATOR */}
                    {activeGreeting && (
                        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-bounce">
                            <div className="bg-red-600 text-white px-8 py-3 rounded-full font-black text-xl shadow-[0_0_50px_rgba(220,38,38,0.8)] border-4 border-white/20 flex items-center gap-4 uppercase tracking-widest">
                                <span className="w-4 h-4 bg-white rounded-full animate-ping"></span>
                                DJ 5:40 AL AIRE
                                <i className="fa-solid fa-tower-broadcast animate-pulse"></i>
                            </div>
                        </div>
                    )}

                    {/* CONNECTION STATUS INDICATOR (HIDDEN/SIMPLIFIED FOR PUBLIC) */}
                    {/* 
                <div className={`mb-6 p-4 rounded-2xl border flex items-center justify-between ...`}>
                   ...
                </div>
                */}

                    {/* STATS */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
                            <div className="relative text-center p-6 glass-dark rounded-3xl border border-white/10 backdrop-blur-xl">
                                <p className="text-4xl font-black bg-gradient-to-br from-yellow-400 to-orange-400 bg-clip-text text-transparent">{pendingGreetings.length}</p>
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-2">En Cola</p>
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
                            <div className="relative text-center p-6 glass-dark rounded-3xl border border-white/10 backdrop-blur-xl">
                                <p className="text-4xl font-black bg-gradient-to-br from-green-400 to-emerald-400 bg-clip-text text-transparent">{todayCompleted.length}</p>
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-2">Leídos Hoy</p>
                            </div>
                        </div>
                    </div>

                    {/* BOTONES DE ACCIÓN */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        {/* ESCRIBIR SALUDO */}
                        <button
                            onClick={() => { setShowForm(!showForm); setShowVoiceRecorder(false); }}
                            className={`py-5 bg-gradient-to-r from-[#a3cf33] to-green-400 text-black font-black rounded-2xl text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all ${showForm ? 'ring-4 ring-[#a3cf33]/50' : ''}`}
                        >
                            <i className={`fa-solid ${showForm ? 'fa-xmark' : 'fa-pen'} text-xl`}></i>
                            {showForm ? 'Cancelar' : '✨ Escribir Saludo'}
                        </button>

                        {/* GRABAR SALUDO DE VOZ */}
                        <button
                            onClick={() => { setShowVoiceRecorder(!showVoiceRecorder); setShowForm(false); }}
                            className={`py-5 bg-gradient-to-r from-red-500 to-pink-500 text-white font-black rounded-2xl text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all ${showVoiceRecorder ? 'ring-4 ring-red-500/50' : ''}`}
                        >
                            <i className={`fa-solid ${showVoiceRecorder ? 'fa-xmark' : 'fa-microphone'} text-xl`}></i>
                            {showVoiceRecorder ? 'Cancelar' : '🎤 Saludo de Voz'}
                        </button>
                    </div>

                    {/* VOICE RECORDER PANEL */}
                    {showVoiceRecorder && (
                        <div className="glass-dark rounded-3xl p-6 border border-red-500/20 backdrop-blur-xl space-y-5 animate-scaleIn mt-4">
                            <div className="text-center space-y-2">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-500/10 border border-red-500/30 rounded-full text-red-300 text-xs font-black uppercase tracking-widest">
                                    <i className="fa-solid fa-microphone"></i>
                                    Saludo de Voz
                                </div>
                                <p className="text-slate-400 text-xs">Graba un mensaje corto (máx {MAX_RECORDING_SECONDS}s) que saldrá al aire 🔴</p>
                            </div>

                            {/* Nombre */}
                            <input
                                type="text"
                                placeholder="Tu nombre (De parte de...)"
                                value={voiceFromName}
                                onChange={(e) => setVoiceFromName(e.target.value)}
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-red-400 transition-all"
                                disabled={isRecording}
                            />

                            {/* Recording Controls */}
                            <div className="flex flex-col items-center gap-4">
                                {/* Timer Display */}
                                <div className={`text-5xl font-black font-mono tabular-nums ${isRecording ? 'text-red-400 animate-pulse' : recordedBlob ? 'text-green-400' : 'text-slate-600'}`}>
                                    {Math.floor(recordingTime / 60).toString().padStart(2, '0')}:{(recordingTime % 60).toString().padStart(2, '0')}
                                </div>

                                {/* Progress bar */}
                                {isRecording && (
                                    <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-red-500 to-pink-500 rounded-full transition-all duration-1000"
                                            style={{ width: `${(recordingTime / MAX_RECORDING_SECONDS) * 100}%` }}
                                        ></div>
                                    </div>
                                )}

                                {/* Buttons */}
                                <div className="flex items-center gap-4">
                                    {!isRecording && !recordedBlob && (
                                        <button
                                            onClick={startRecording}
                                            className="w-20 h-20 rounded-full bg-gradient-to-br from-red-500 to-red-600 text-white flex items-center justify-center shadow-[0_0_30px_rgba(239,68,68,0.5)] hover:shadow-[0_0_50px_rgba(239,68,68,0.7)] hover:scale-110 transition-all active:scale-95"
                                        >
                                            <i className="fa-solid fa-microphone text-3xl"></i>
                                        </button>
                                    )}

                                    {isRecording && (
                                        <button
                                            onClick={stopRecording}
                                            className="w-20 h-20 rounded-full bg-white text-red-600 flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-110 transition-all active:scale-95 animate-pulse"
                                        >
                                            <i className="fa-solid fa-stop text-3xl"></i>
                                        </button>
                                    )}

                                    {recordedBlob && !isRecording && (
                                        <>
                                            {/* Re-record */}
                                            <button
                                                onClick={() => { setRecordedBlob(null); setRecordingTime(0); }}
                                                className="w-14 h-14 rounded-full bg-white/10 text-white flex items-center justify-center hover:bg-white/20 transition-all"
                                                title="Volver a grabar"
                                            >
                                                <i className="fa-solid fa-rotate-left text-xl"></i>
                                            </button>

                                            {/* Preview */}
                                            <button
                                                onClick={() => {
                                                    if (recordedBlob) {
                                                        const url = URL.createObjectURL(recordedBlob);
                                                        const audio = new Audio(url);
                                                        audio.play();
                                                        audio.onended = () => URL.revokeObjectURL(url);
                                                    }
                                                }}
                                                className="w-14 h-14 rounded-full bg-blue-500/20 text-blue-400 flex items-center justify-center hover:bg-blue-500/30 transition-all border border-blue-500/30"
                                                title="Escuchar preview"
                                            >
                                                <i className="fa-solid fa-play text-xl"></i>
                                            </button>

                                            {/* Send */}
                                            <button
                                                onClick={sendVoiceGreeting}
                                                disabled={isUploading}
                                                className="w-20 h-20 rounded-full bg-gradient-to-br from-[#a3cf33] to-green-500 text-black flex items-center justify-center shadow-[0_0_30px_rgba(163,207,51,0.5)] hover:shadow-[0_0_50px_rgba(163,207,51,0.7)] hover:scale-110 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isUploading
                                                    ? <i className="fa-solid fa-spinner fa-spin text-2xl"></i>
                                                    : <i className="fa-solid fa-paper-plane text-2xl"></i>
                                                }
                                            </button>
                                        </>
                                    )}
                                </div>

                                {/* Status Label */}
                                <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">
                                    {isRecording ? '🔴 Grabando...' : recordedBlob ? '✅ Listo para enviar' : 'Presiona para grabar'}
                                </p>

                                {/* Cancel */}
                                <button
                                    onClick={cancelRecording}
                                    className="text-xs text-slate-500 hover:text-red-400 transition-all uppercase tracking-widest"
                                >
                                    Cancelar
                                </button>
                            </div>
                        </div>
                    )}

                    {/* TEXT FORM - PASO 1: Llenar datos */}
                    {showForm && !isPreviewingText && (
                        <div className="glass-dark rounded-3xl p-6 border border-white/10 backdrop-blur-xl space-y-4 animate-scaleIn mt-4">
                            <div className="bg-purple-500/10 border border-purple-500/20 p-4 rounded-xl flex items-start gap-3">
                                <i className="fa-solid fa-wand-magic-sparkles text-purple-400 mt-1"></i>
                                <p className="text-purple-200 text-xs text-left">
                                    ✨ La IA transformará tu mensaje en un saludo de DJ profesional antes de leerlo al aire.
                                </p>
                            </div>
                            <input
                                type="text"
                                placeholder="De parte de..."
                                value={formData.from}
                                onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-[#a3cf33] transition-all"
                            />
                            <input
                                type="text"
                                placeholder="Para..."
                                value={formData.to}
                                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-[#a3cf33] transition-all"
                            />
                            <textarea
                                placeholder="Mensaje (opcional)..."
                                value={formData.message}
                                onChange={(e) => {
                                    const val = e.target.value;

                                    // Detectar formato auto-parse: (de.. alysson Para... jovita saludo... feliz cumpleaños )
                                    const lowerVal = val.toLowerCase();
                                    if (lowerVal.includes('de..') && lowerVal.includes('para..') && lowerVal.includes('saludo..')) {
                                        const regex = /de\.\.\s*([^\n\(]*?)\s*para\.\.\.\s*([^\n\(]*?)\s*saludo\.\.\.\s*([^\n\(]*)/i;
                                        const match = val.match(regex);

                                        if (match) {
                                            const from = match[1].trim();
                                            const to = match[2].trim();
                                            const msg = match[3].replace(/\)$/, '').trim();

                                            if (from && to && msg) {
                                                setFormData({ from, to, message: msg });
                                                return; // Detener auto-update si detectamos el patron
                                            }
                                        }
                                    }

                                    setFormData({ ...formData, message: val });
                                }}
                                rows={3}
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-[#a3cf33] transition-all resize-none"
                            />
                            <button
                                onClick={enhanceGreeting}
                                disabled={isEnhancing}
                                className="w-full py-4 bg-gradient-to-r from-purple-500 to-violet-500 text-white font-black rounded-2xl text-sm uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-70 disabled:scale-100"
                            >
                                {isEnhancing ? (
                                    <>
                                        <i className="fa-solid fa-wand-magic-sparkles mr-2 animate-pulse"></i>
                                        IA mejorando el mensaje...
                                    </>
                                ) : (
                                    <>
                                        <i className="fa-solid fa-wand-magic-sparkles mr-2"></i>
                                        ✨ Preparar Saludo con IA
                                    </>
                                )}
                            </button>
                        </div>
                    )}

                    {/* TEXT PREVIEW - PASO 2: Vista previa del mensaje mejorado */}
                    {isPreviewingText && enhancedPreview && (
                        <div className="glass-dark rounded-3xl p-6 border border-purple-500/30 backdrop-blur-xl space-y-5 animate-scaleIn mt-4">
                            <div className="text-center space-y-2">
                                <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500/10 border border-purple-500/30 rounded-full text-purple-300 text-xs font-black uppercase tracking-widest">
                                    <i className="fa-solid fa-wand-magic-sparkles"></i>
                                    Mensaje Mejorado por IA
                                </div>
                                <p className="text-slate-400 text-xs">De: {previewFormData.from} → Para: {previewFormData.to}</p>
                            </div>

                            {/* Texto del mensaje mejorado */}
                            <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                                <p className="text-white text-sm italic leading-relaxed">
                                    "{isEnhancing ? '...' : enhancedPreview}"
                                </p>
                            </div>

                            {/* Botones de control (estilo igual a voz) */}
                            <div className="flex items-center justify-center gap-6">
                                {/* Re-generar */}
                                <button
                                    onClick={reEnhanceGreeting}
                                    disabled={isEnhancing}
                                    className="w-14 h-14 rounded-full bg-slate-700 text-slate-300 flex items-center justify-center hover:bg-slate-600 transition-all disabled:opacity-50"
                                    title="Re-generar con IA"
                                >
                                    <i className={`fa-solid fa-rotate ${isEnhancing ? 'animate-spin' : ''}`}></i>
                                </button>

                                {/* Escuchar preview */}
                                <button
                                    onClick={previewEnhancedAudio}
                                    disabled={isPlayingPreview || isEnhancing}
                                    className="w-14 h-14 rounded-full bg-blue-600/80 text-white flex items-center justify-center hover:bg-blue-500 transition-all disabled:opacity-50"
                                    title="Escuchar preview"
                                >
                                    <i className={`fa-solid ${isPlayingPreview ? 'fa-volume-high animate-pulse' : 'fa-play'}`}></i>
                                </button>

                                {/* Enviar */}
                                <button
                                    onClick={sendEnhancedGreeting}
                                    disabled={isEnhancing}
                                    className="w-16 h-16 rounded-full bg-gradient-to-br from-[#a3cf33] to-green-400 text-black flex items-center justify-center hover:scale-110 transition-all shadow-lg shadow-[#a3cf33]/30"
                                    title="Enviar al aire"
                                >
                                    <i className="fa-solid fa-paper-plane text-2xl"></i>
                                </button>
                            </div>

                            {/* Status */}
                            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold text-center">
                                {isEnhancing ? '🔄 Re-generando...' : isPlayingPreview ? '🎧 Escuchando preview...' : '✅ Listo para enviar'}
                            </p>

                            {/* Cancelar */}
                            <button
                                onClick={cancelPreview}
                                className="text-xs text-slate-500 hover:text-red-400 transition-all uppercase tracking-widest block mx-auto"
                            >
                                Cancelar
                            </button>
                        </div>
                    )}

                    {/* PENDIENTES */}
                    {pendingGreetings.length > 0 && (
                        <div className="space-y-4 mt-8">
                            <h2 className="text-2xl font-black text-[#a3cf33] uppercase flex items-center gap-3">
                                <i className="fa-solid fa-hourglass-half"></i>
                                Tus Saludos ({pendingGreetings.length})
                            </h2>

                            {pendingGreetings.map((greeting) => (
                                <div
                                    key={greeting.id}
                                    className={`glass-dark rounded-3xl p-6 border transition-all ${activeGreeting === greeting.id
                                        ? 'border-[#a3cf33] scale-105 shadow-lg shadow-[#a3cf33]/30'
                                        : 'border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2 text-[#a3cf33] font-bold">
                                                <i className="fa-solid fa-arrow-right"></i>
                                                <span>Para: {greeting.to}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                <i className="fa-solid fa-user"></i>
                                                <span>De: {greeting.from}</span>
                                            </div>
                                            {greeting.message && (
                                                <p className="text-slate-300 text-sm italic pl-6">"{greeting.message}"</p>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            {activeGreeting === greeting.id ? (
                                                <button
                                                    onClick={stopReading}
                                                    className="px-6 py-3 bg-red-500 text-white font-black rounded-xl text-xs uppercase hover:bg-red-600 transition-all flex items-center gap-2"
                                                >
                                                    <i className="fa-solid fa-stop"></i>
                                                    Detener
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => readGreeting(greeting)}
                                                        className="px-6 py-3 bg-gradient-to-r from-[#a3cf33] to-green-400 text-black font-black rounded-xl text-xs uppercase hover:scale-105 transition-all flex items-center gap-2"
                                                    >
                                                        <i className="fa-solid fa-play"></i>
                                                        Sonar
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* COMPLETADOS HOY */}
                    {todayCompleted.length > 0 && (
                        <div className="space-y-4 mt-8">
                            <h2 className="text-2xl font-black text-green-400 uppercase flex items-center gap-3">
                                <i className="fa-solid fa-check-circle"></i>
                                Ya Sonaron ({todayCompleted.length})
                            </h2>

                            {todayCompleted.map((greeting) => (
                                <div
                                    key={greeting.id}
                                    className="glass-dark rounded-3xl p-4 border border-white/5 opacity-60 hover:opacity-100 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                                                <i className="fa-solid fa-check"></i>
                                                <span>Para: {greeting.to} (de {greeting.from})</span>
                                            </div>
                                            {greeting.message && (
                                                <p className="text-slate-400 text-xs pl-6">"{greeting.message}"</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {greetings.length === 0 && (
                        <div className="text-center py-20 glass-dark rounded-[3rem] border border-white/5 backdrop-blur-xl mt-6">
                            <i className="fa-solid fa-heart text-6xl text-slate-700 mb-6"></i>
                            <p className="text-slate-500 text-base font-bold mb-4">No hay saludos todavía</p>
                            <p className="text-slate-600 text-sm">¡Sé el primero en mandar uno!</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default LiveGreetingsView;
