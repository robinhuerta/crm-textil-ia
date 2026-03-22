import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zplvreuiuosmmeoeaeaz.supabase.co';
export const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbHZyZXVpdW9zbW1lb2VhZWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NDc1MDcsImV4cCI6MjA4NTIyMzUwN30.NZE9qW4rKuZ_GZ2Xu2W3qo_vnKwO1Tud6OOAypnRg14';

// Cliente con timeout extendido
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
        timeout: 30000, // 30 segundos
        params: {
            eventsPerSecond: 10,
        }
    }
});

// Types for polls
export interface Poll {
    id: number;
    question: string;
    options: string[];
    votes: Record<string, number>;
    ends_at: string;
    created_at: string;
}

// Get active poll
export async function getActivePoll(): Promise<Poll | null> {
    const now = new Date().toISOString();
    const { data, error } = await supabase
        .from('polls')
        .select('*')
        .gt('ends_at', now)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
    if (error || !data) return null;
    return data as Poll;
}

// Vote for an option
export async function voteForOption(pollId: number, option: string): Promise<boolean> {
    const { data: poll, error: fetchError } = await supabase.from('polls').select('votes').eq('id', pollId).single();
    if (fetchError || !poll) return false;
    const currentVotes = poll.votes || {};
    currentVotes[option] = (currentVotes[option] || 0) + 1;
    const { error: updateError } = await supabase.from('polls').update({ votes: currentVotes }).eq('id', pollId);
    return !updateError;
}

// --- REALTIME RADIO EVENTS ---
export const RADIO_EVENTS_CHANNEL = 'radio_broadcast_v11';

let radioChannel: any = null;
let listeners: ((payload: any) => void)[] = [];
let statusListeners: ((status: string, details?: string) => void)[] = [];
let retryCount = 0;
const MAX_RETRIES = 10;

const notifyStatus = (status: string, details?: string) => {
    console.log(`📡 [RadioStatus] ${status} ${details || ''}`);
    statusListeners.forEach(l => l(status, details));
};

const localChannel = typeof window !== 'undefined' ? new BroadcastChannel('radio-local-fallback') : null;

if (localChannel) {
    localChannel.onmessage = (event) => {
        if (event.data?.type === 'broadcast' && event.data?.event === 'live_greeting') {
            listeners.forEach(cb => cb(event.data.payload));
        }
    };
}

// Detección de estado de red del navegador
if (typeof window !== 'undefined') {
    window.addEventListener('online', () => {
        console.log('🌐 Network ONLINE - Forzando reconexión...');
        forceReconnect();
    });
    window.addEventListener('offline', () => {
        console.log('🌐 Network OFFLINE');
        notifyStatus('LOCAL_MODE', 'Sin conexión a internet');
    });
}

// Inicializar canal (MODO BASE DE DATOS)
export const setupRadioChannel = () => {
    // Si ya estamos suscritos y conectados, no hacer nada
    if (radioChannel && (radioChannel.state === 'joined' || radioChannel.state === 'joining')) {
        return radioChannel;
    }

    if (radioChannel) {
        console.log('🧹 Limpiando canal previo para reconexión...');
        supabase.removeChannel(radioChannel);
        radioChannel = null;
    }

    console.log(`📡 [RadioDB] Iniciando conexión a Tabla radio_greetings (Intento ${retryCount + 1})...`);

    radioChannel = supabase.channel('radio_db_listener')
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'radio_greetings' },
            (payload) => {
                console.log('🗣️ [RadioDB] Nuevo saludo detectado en BD:', payload.new);
                listeners.forEach(cb => cb(payload.new));
            }
        )
        .subscribe((status: string, err: any) => {
            let errorMsg = '';
            if (err) {
                errorMsg = err.message || JSON.stringify(err);
            }

            // Ignorar eventos de canal cerrado si estamos reintentando manualmente
            if (status === 'CLOSED' && retryCount === 0) {
            }

            notifyStatus(status, errorMsg);

            if (status === 'SUBSCRIBED') {
                console.log('✅ RADIO DB ONLINE - Escuchando saludos');
                retryCount = 0;
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || (status === 'CLOSED' && retryCount > 0)) {
                if (retryCount >= MAX_RETRIES) {
                    console.error(`❌ Supabase: máximo de reintentos alcanzado (${MAX_RETRIES}). Modo local activado.`);
                    notifyStatus('LOCAL_MODE', 'Sin conexión al servidor de saludos');
                    return;
                }

                console.warn(`⚠️ Error de conexión DB: ${status}. Reintentando (${retryCount + 1}/${MAX_RETRIES})...`);
                notifyStatus('LOCAL_MODE', `Reconectando DB: ${status}`);

                const baseDelay = 2000;
                const maxDelay = 15000;
                const delay = Math.min(baseDelay * Math.pow(1.5, retryCount), maxDelay);

                setTimeout(() => {
                    retryCount++;
                    setupRadioChannel();
                }, delay);
            }
        });

    return radioChannel;
};

// --- VOICE GREETINGS STORAGE ---
// Subir audio grabado a Supabase Storage
export const uploadVoiceGreeting = async (audioBlob: Blob, greetingId: string): Promise<string | null> => {
    try {
        const extension = audioBlob.type.includes('webm') ? 'webm' : audioBlob.type.includes('ogg') ? 'ogg' : 'mp3';
        const fileName = `voice_${greetingId}_${Date.now()}.${extension}`;

        const { data, error } = await supabase.storage
            .from('radio-voice-greetings')
            .upload(fileName, audioBlob, {
                contentType: audioBlob.type,
                cacheControl: '3600',
                upsert: false
            });

        if (error) {
            console.error('❌ Error subiendo audio:', error.message);
            return null;
        }

        // Obtener URL pública
        const { data: urlData } = supabase.storage
            .from('radio-voice-greetings')
            .getPublicUrl(data.path);

        console.log('✅ Audio subido:', urlData.publicUrl);
        return urlData.publicUrl;
    } catch (e: any) {
        console.error('❌ Error crítico subiendo audio:', e);
        return null;
    }
};

// Enviar saludo (MODO BASE DE DATOS - HTTP INSERT)
// Esto es 100% fiable en móviles porque usa HTTP estándar, no WebSockets.
// Enviar saludo con fallback de tabla flexible
export const broadcastGreeting = async (greeting: any): Promise<{ success: boolean; error?: string }> => {
    console.log('📤 [RadioDB] Enviando saludo...');

    const dbPayload: any = {
        from_name: greeting.from || 'Anónimo',
        to_name: greeting.to || 'Todos',
        message: greeting.message || '',
        created_at: new Date().toISOString(),
        is_played: false
    };

    // Si tiene audio grabado, incluir la URL
    if (greeting.audio_url) {
        dbPayload.audio_url = greeting.audio_url;
    }

    // INTENTO 1: Tabla en Inglés (radio_greetings)
    let { error } = await supabase.from('radio_greetings').insert([dbPayload]);

    if (!error) {
        console.log('✅ [RadioDB] Guardado en radio_greetings');
        return { success: true };
    }

    console.warn('⚠️ Falló radio_greetings, probando radio_saludos...', error.message);

    // INTENTO 2: Tabla en Español (radio_saludos) - Por si el traductor cambió el nombre
    const { error: error2 } = await supabase.from('radio_saludos').insert([dbPayload]);

    if (!error2) {
        console.log('✅ [RadioDB] Guardado en radio_saludos');
        return { success: true };
    }

    // Si ambos fallan
    console.error('❌ Error final DB:', error2);
    const finalError = `Error 1: ${error.message} | Error 2: ${error2.message}`;
    notifyStatus('LOCAL_MODE', 'Fallo DB: ' + error2.message);
    return { success: false, error: finalError };
};

// --- LISTENER CHAT ---
export interface ChatMessage {
    id: string;
    nickname: string;
    message: string;
    created_at: string;
}

let chatChannel: any = null;
let chatListeners: ((msg: ChatMessage) => void)[] = [];

export const sendChatMessage = async (nickname: string, message: string): Promise<boolean> => {
    const { error } = await supabase.from('listener_chat').insert([{ nickname, message }]);
    if (error) {
        console.error('❌ [Chat] Error enviando mensaje:', error.message);
        return false;
    }
    return true;
};

export const getChatHistory = async (limit = 50): Promise<ChatMessage[]> => {
    const { data, error } = await supabase
        .from('listener_chat')
        .select('*')
        .order('created_at', { ascending: true })
        .limit(limit);
    if (error || !data) return [];
    return data as ChatMessage[];
};

export const subscribeToChatMessages = (callback: (msg: ChatMessage) => void) => {
    chatListeners.push(callback);

    if (!chatChannel) {
        chatChannel = supabase.channel('listener_chat_channel')
            .on(
                'postgres_changes',
                { event: 'INSERT', schema: 'public', table: 'listener_chat' },
                (payload) => {
                    chatListeners.forEach(cb => cb(payload.new as ChatMessage));
                }
            )
            .subscribe();
    }

    return () => {
        chatListeners = chatListeners.filter(l => l !== callback);
        if (chatListeners.length === 0 && chatChannel) {
            supabase.removeChannel(chatChannel);
            chatChannel = null;
        }
    };
};

export const subscribeToRadioEvents = (callback: (payload: any) => void) => {
    listeners.push(callback);
    setupRadioChannel();
    return () => {
        listeners = listeners.filter(l => l !== callback);
    };
};

export const onRadioConnectionChange = (callback: (status: string, details?: string) => void) => {
    statusListeners.push(callback);
    setupRadioChannel();
    return () => {
        statusListeners = statusListeners.filter(l => l !== callback);
    };
};

// Forzar reconexión manual
export const forceReconnect = () => {
    retryCount = 0;
    setupRadioChannel();
};

// VIGILANTE DE CONEXIÓN (WATCHDOG)
// Verifica cada 5 segundos que la conexión esté saludable
export const startConnectionWatchdog = () => {
    if (typeof window === 'undefined') return;

    setInterval(() => {
        const isOnline = navigator.onLine;

        if (!isOnline) {
            notifyStatus('LOCAL_MODE', 'Sin internet (Watchdog)');
            return;
        }

        // Si el canal no existe o no está unido/uniéndose, forzar reinicio
        if (!radioChannel || (radioChannel.state !== 'joined' && radioChannel.state !== 'joining')) {
            console.warn(`🐕 [Watchdog] Canal en estado inválido (${radioChannel?.state || 'null'}). Forzando reinicio...`);
            notifyStatus('LOCAL_MODE', 'Recuperando conexión...');
            forceReconnect();
        } else {
            // Si está unido, asegurar que la UI lo sepa (autocorrección visual)
            if (radioChannel.state === 'joined') {
                // Opcional: Podríamos emitir 'SUBSCRIBED' periódicamente si la UI se desincroniza,
                // pero mejor solo hacerlo si detectamos que la UI cree que está desconectada.
            }
        }
    }, 5000);
};
