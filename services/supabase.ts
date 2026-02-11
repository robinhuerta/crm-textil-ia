import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zplvreuiuosmmeoaeaz.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpwbHZyZXVpdW9zbW1lb2VhZWF6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk2NDc1MDcsImV4cCI6MjA4NTIyMzUwN30.NZE9qW4rKuZ_GZ2Xu2W3qo_vnKwO1Tud6OOAypnRg14';

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
    // Get current poll
    const { data: poll, error: fetchError } = await supabase
        .from('polls')
        .select('votes')
        .eq('id', pollId)
        .single();

    if (fetchError || !poll) return false;

    // Increment vote count
    const currentVotes = poll.votes || {};
    currentVotes[option] = (currentVotes[option] || 0) + 1;

    // Update poll
    const { error: updateError } = await supabase
        .from('polls')
        .update({ votes: currentVotes })
        .eq('id', pollId);

    return !updateError;
}

// Check if user already voted (using localStorage)
export function hasUserVoted(pollId: number): boolean {
    const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]');
    return votedPolls.includes(pollId);
}

// Mark poll as voted
export function markPollAsVoted(pollId: number): void {
    const votedPolls = JSON.parse(localStorage.getItem('votedPolls') || '[]');
    if (!votedPolls.includes(pollId)) {
        votedPolls.push(pollId);
        localStorage.setItem('votedPolls', JSON.stringify(votedPolls));
    }
}

// Create a new poll (for admin use)
export async function createPoll(question: string, options: string[], durationHours: number = 12): Promise<Poll | null> {
    const endsAt = new Date();
    endsAt.setHours(endsAt.getHours() + durationHours);

    const votes: Record<string, number> = {};
    options.forEach(opt => votes[opt] = 0);

    const { data, error } = await supabase
        .from('polls')
        .insert({
            question,
            options,
            votes,
            ends_at: endsAt.toISOString()
        })
        .select()
        .single();

    if (error) {
        console.error('Error creating poll:', error);
        return null;
    }
    return data as Poll;
}

// Get time remaining for poll
export function getTimeRemaining(endsAt: string): { hours: number; minutes: number; seconds: number; expired: boolean } {
    const now = new Date().getTime();
    const end = new Date(endsAt).getTime();
    const diff = end - now;

    if (diff <= 0) {
        return { hours: 0, minutes: 0, seconds: 0, expired: true };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);

    return { hours, minutes, seconds, expired: false };
}

// --- REALTIME RADIO EVENTS (GREETINGS) ---

export const RADIO_EVENTS_CHANNEL = 'radio-global-live-v1';

// Fallback Local (BroadcastChannel API - Native Browser)
const localChannel = new BroadcastChannel('radio-local-fallback');

// Canal único global
let radioChannel: ReturnType<typeof supabase.channel> | null = null;
let listeners: ((payload: any) => void)[] = [];
let statusListeners: ((status: string) => void)[] = [];

// Notificar estado a la UI
const notifyStatus = (status: string) => {
    console.log(`📡 [RadioConnection] Status: ${status}`);
    statusListeners.forEach(l => l(status));
};

// Escuchar canal local (Fallback)
localChannel.onmessage = (event) => {
    console.log('📡 [Local Mode] Message received:', event.data);
    if (event.data?.type === 'broadcast' && event.data?.event === 'live_greeting') {
        listeners.forEach(cb => cb(event.data.payload));
    }
};

// Inicializar canal (Singleton)
const getChannel = () => {
    if (radioChannel) {
        // Si el canal existe pero está en un estado de error, reintentar suscripción
        if (radioChannel.state === 'closed' || radioChannel.state === 'errored') {
            console.log('🔄 [RadioConnection] Channel closed/errored, resubscribing...');
            radioChannel.subscribe();
        }
        return radioChannel;
    }

    console.log('📡 [RadioConnection] Initializing Supabase channel...');
    radioChannel = supabase.channel(RADIO_EVENTS_CHANNEL, {
        config: {
            broadcast: {
                self: true,
                ack: true // Habilitar ACKs para mayor confiabilidad
            },
            presence: { key: 'radio-listener' },
        }
    });

    radioChannel
        .on('broadcast', { event: 'live_greeting' }, (payload) => {
            console.log('📡 [RadioConnection] Event received:', payload);
            listeners.forEach(cb => cb(payload.payload));
        })
        .subscribe((status, err) => {
            notifyStatus(status);

            if (status === 'SUBSCRIBED') {
                console.log('✅ [RadioConnection] Subscribed to Global Radio');
            }

            if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
                console.error('❌ [RadioConnection] Connection failed:', status, err);
                notifyStatus('LOCAL_MODE');
            }
        });

    return radioChannel;
};

// Enviar saludo
export const broadcastGreeting = async (greeting: any) => {
    const channel = getChannel();

    // 1. Intentar enviar por Supabase (Si está conectado)
    let sentViaSupabase = false;

    // Forzar reconexión si el canal no está unido
    if (channel.state !== 'joined') {
        console.warn(`📡 [RadioConnection] Channel in state ${channel.state}, attempting resubscribe...`);
        channel.subscribe();
    }

    try {
        // Enviar con timeout corto para no bloquear la UI si falla
        const sendPromise = channel.send({
            type: 'broadcast',
            event: 'live_greeting',
            payload: greeting
        });

        const timeoutPromise = new Promise((_, reject) =>
            setTimeout(() => reject(new Error('TIMEOUT')), 4000)
        );

        const resp = await Promise.race([sendPromise, timeoutPromise]);

        if (resp === 'ok') {
            sentViaSupabase = true;
            console.log('✅ [RadioConnection] Sent via Global Supabase');
        } else {
            console.warn('⚠️ [RadioConnection] Supabase send failed:', resp);
        }
    } catch (err) {
        console.warn('❌ [RadioConnection] Supabase exception:', err);
    }

    // 2. SIEMPRE enviar por canal local también (para pestañas en la misma PC)
    console.log('📡 [Local Mode] Broadcasting via fallback channel...');
    localChannel.postMessage({
        type: 'broadcast',
        event: 'live_greeting',
        payload: greeting
    });

    // 3. Notificar a la UI si falló lo global para que el admin sepa
    if (!sentViaSupabase) {
        notifyStatus('LOCAL_MODE');
    } else {
        notifyStatus('SUBSCRIBED');
    }

    return sentViaSupabase;
};

// Suscribirse (UI)
export const subscribeToRadioEvents = (callback: (payload: any) => void) => {
    listeners.push(callback);
    getChannel();
    return () => {
        listeners = listeners.filter(l => l !== callback);
    };
};

// Hook de estado (UI)
export const onRadioConnectionChange = (callback: (status: string) => void) => {
    statusListeners.push(callback);
    // Estado inicial
    if (radioChannel) {
        if (radioChannel.state === 'closed' || radioChannel.state === 'errored') {
            callback('LOCAL_MODE');
        } else {
            callback(radioChannel.state);
        }
    } else {
        callback('CONNECTING');
    }

    return () => {
        statusListeners = statusListeners.filter(l => l !== callback);
    };
};
