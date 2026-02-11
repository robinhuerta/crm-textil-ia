import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zplvreuiuosmmeoaeaz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbHZyZXVpdW9zbW1lb2VhZWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NDc1MDcsImV4cCI6MjA4NTIyMzUwN30.NZE9qW4rKuZ_GZ2Xu2W3qo_vnKwO1Tud6OOAypnRg14';

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

// Inicializar canal
export const setupRadioChannel = () => {
    // Si ya estamos suscritos de verdad, no hacer nada
    if (radioChannel && radioChannel.state === 'joined') return radioChannel;

    if (radioChannel) {
        console.log('🧹 Eliminando canal previo...');
        supabase.removeChannel(radioChannel);
    }

    console.log(`📡 [Radio] Conectando a ${RADIO_EVENTS_CHANNEL}...`);

    radioChannel = supabase.channel(RADIO_EVENTS_CHANNEL, {
        config: { broadcast: { self: true } }
    });

    radioChannel
        .on('broadcast', { event: 'live_greeting' }, (payload: any) => {
            console.log('🗣️ [Radio] Saludo recibido');
            listeners.forEach(cb => cb(payload.payload));
        })
        .subscribe((status: string, err: any) => {
            let errorMsg = '';
            if (err) {
                errorMsg = err.message || JSON.stringify(err);
            }

            notifyStatus(status, errorMsg);

            if (status === 'SUBSCRIBED') {
                console.log('✅ RADIO ONLINE');
                retryCount = 0;
            } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED' || status === 'TIMED_OUT') {
                notifyStatus('LOCAL_MODE', `Error: ${status} ${errorMsg}`);

                // Reintento automático limitado
                if (retryCount < 5) {
                    retryCount++;
                    setTimeout(() => setupRadioChannel(), 5000 * retryCount);
                }
            }
        });

    return radioChannel;
};

// Enviar saludo
export const broadcastGreeting = async (greeting: any) => {
    const channel = setupRadioChannel();
    let sentGlobal = false;

    try {
        const resp = await Promise.race([
            channel.send({
                type: 'broadcast',
                event: 'live_greeting',
                payload: greeting
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT_BROADCAST')), 6000))
        ]);
        if (resp === 'ok') sentGlobal = true;
    } catch (e) {
        console.error('Broadcast failed:', e);
    }

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
