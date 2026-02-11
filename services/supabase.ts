import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zplvreuiuosmmeoaeaz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbHZyZXVpdW9zbW1lb2VhZWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NDc1MDcsImV4cCI6MjA4NTIyMzUwN30.NZE9qW4rKuZ_GZ2Xu2W3qo_vnKwO1Tud6OOAypnRg14';

// Forzar configuración robusta de Realtime
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    realtime: {
        params: {
            eventsPerSecond: 10,
        },
    },
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

// Get active poll (not expired)
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
    const { data: poll, error: fetchError } = await supabase
        .from('polls')
        .select('votes')
        .eq('id', pollId)
        .single();

    if (fetchError || !poll) return false;

    const currentVotes = poll.votes || {};
    currentVotes[option] = (currentVotes[option] || 0) + 1;

    const { error: updateError } = await supabase
        .from('polls')
        .update({ votes: currentVotes })
        .eq('id', pollId);

    return !updateError;
}

export function hasUserVoted(pollId: number): boolean {
    const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]');
    return votedPolls.includes(pollId);
}

export function markPollAsVoted(pollId: number): void {
    const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]');
    if (!votedPolls.includes(pollId)) {
        votedPolls.push(pollId);
        localStorage.setItem('votedPolls', JSON.stringify(votedPolls));
    }
}

// --- REALTIME RADIO EVENTS (GREETINGS) ---

export const RADIO_EVENTS_CHANNEL = 'radio_broadcast_v1';

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

// Inicializar canal
export const setupRadioChannel = () => {
    // Si ya estamos suscritos, no hacer nada
    if (radioChannel && (radioChannel.state === 'joined' || radioChannel.state === 'joining')) {
        return radioChannel;
    }

    // Limpiar previo si existe
    if (radioChannel) {
        supabase.removeChannel(radioChannel);
    }

    console.log(`📡 [Radio] Conectando a canal: ${RADIO_EVENTS_CHANNEL}`);

    // Crear canal simple
    radioChannel = supabase.channel(RADIO_EVENTS_CHANNEL);

    radioChannel
        .on('broadcast', { event: 'live_greeting' }, (payload: any) => {
            console.log('🗣️ [Radio] Evento recibido:', payload);
            listeners.forEach(cb => cb(payload.payload));
        })
        .subscribe(async (status: string, err: any) => {
            notifyStatus(status, err);

            if (status === 'SUBSCRIBED') {
                console.log('✅ RADIO ONLINE');
                retryCount = 0;
            } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED' || status === 'TIMED_OUT') {
                console.warn(`⚠️ Error: ${status}`, err);

                // Reintento exponencial limitado
                if (retryCount < 8) {
                    retryCount++;
                    const delay = 2000 * retryCount;
                    setTimeout(() => setupRadioChannel(), delay);
                }
            }
        });

    return radioChannel;
};

// Enviar saludo
export const broadcastGreeting = async (greeting: any) => {
    const channel = setupRadioChannel();
    let sentViaSupabase = false;

    try {
        const resp = await Promise.race([
            channel.send({
                type: 'broadcast',
                event: 'live_greeting',
                payload: greeting
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 4000))
        ]);

        if (resp === 'ok') sentViaSupabase = true;
    } catch (err) {
        console.error('Broadcast failed:', err);
    }

    // Fallback local obligatorio
    if (localChannel) {
        localChannel.postMessage({ type: 'broadcast', event: 'live_greeting', payload: greeting });
    }

    return sentViaSupabase;
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
    if (radioChannel) {
        callback(radioChannel.state === 'joined' ? 'SUBSCRIBED' : radioChannel.state);
    }
    return () => {
        statusListeners = statusListeners.filter(l => l !== callback);
    };
};
