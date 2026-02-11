import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zplvreuiuosmmeoaeaz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbHZyZXVpdW9zbW1lb2VhZWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NDc1MDcsImV4cCI6MjA4NTIyMzUwN30.NZE9qW4rKuZ_GZ2Xu2W3qo_vnKwO1Tud6OOAypnRg14';

// Cliente estandar
export const supabase = createClient(supabaseUrl, supabaseAnonKey);

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
export const RADIO_EVENTS_CHANNEL = 'radio_broadcast_v10'; // Nuevo canal para evitar cache de error

let radioChannel: any = null;
let listeners: ((payload: any) => void)[] = [];
let statusListeners: ((status: string, error?: any) => void)[] = [];
let retryCount = 0;

const notifyStatus = (status: string, error?: any) => {
    console.log(`📡 [RadioStatus] ${status}`, error || '');
    statusListeners.forEach(l => l(status, error));
};

const localChannel = typeof window !== 'undefined' ? new BroadcastChannel('radio-local-fallback') : null;

if (localChannel) {
    localChannel.onmessage = (event) => {
        if (event.data?.type === 'broadcast' && event.data?.event === 'live_greeting') {
            listeners.forEach(cb => cb(event.data.payload));
        }
    };
}

// Inicializar canal robusto
export const setupRadioChannel = () => {
    if (radioChannel && (radioChannel.state === 'joined' || radioChannel.state === 'joining')) {
        return radioChannel;
    }

    if (radioChannel) {
        supabase.removeChannel(radioChannel);
    }

    console.log(`📡 [Radio] Conectando a ${RADIO_EVENTS_CHANNEL}...`);

    // Canal simple con broadcast
    radioChannel = supabase.channel(RADIO_EVENTS_CHANNEL, {
        config: {
            broadcast: { self: true }
        }
    });

    radioChannel
        .on('broadcast', { event: 'live_greeting' }, (payload: any) => {
            console.log('🗣️ [Radio] Saludo recibido globalmente');
            listeners.forEach(cb => cb(payload.payload));
        })
        .subscribe((status: string, err: any) => {
            notifyStatus(status, err);

            if (status === 'SUBSCRIBED') {
                console.log('✅ RADIO ONLINE');
                retryCount = 0;
            } else {
                console.warn(`⚠️ [Radio] Estado: ${status}`, err || '');
                // Fallback a local si falla lo global
                if (status === 'CHANNEL_ERROR' || status === 'CLOSED' || status === 'TIMED_OUT') {
                    notifyStatus('LOCAL_MODE');
                    if (retryCount < 5) {
                        retryCount++;
                        setTimeout(() => setupRadioChannel(), 3000 * retryCount);
                    }
                }
            }
        });

    return radioChannel;
};

// Enviar saludo
export const broadcastGreeting = async (greeting: any) => {
    const channel = setupRadioChannel();
    let sentGlobal = false;

    // Asegurar que el canal está listo para broadcast
    if (channel.state === 'joined') {
        try {
            const resp = await channel.send({
                type: 'broadcast',
                event: 'live_greeting',
                payload: greeting
            });
            if (resp === 'ok') sentGlobal = true;
        } catch (e) {
            console.error('Broadcast failed:', e);
        }
    }

    // SIEMPRE enviar local
    if (localChannel) {
        localChannel.postMessage({ type: 'broadcast', event: 'live_greeting', payload: greeting });
    }

    return sentGlobal;
};

export const subscribeToRadioEvents = (callback: (payload: any) => void) => {
    listeners.push(callback);
    setupRadioChannel();
    return () => {
        listeners = listeners.filter(l => l !== callback);
    };
};

export const onRadioConnectionChange = (callback: (status: string, error?: any) => void) => {
    statusListeners.push(callback);
    setupRadioChannel(); // Asegurar que intentamos conectar al pedir el estado
    return () => {
        statusListeners = statusListeners.filter(l => l !== callback);
    };
};
