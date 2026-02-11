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

export const RADIO_EVENTS_CHANNEL = 'radio_broadcast_v1';

let radioChannel: any = null;
let listeners: ((payload: any) => void)[] = [];
let statusListeners: ((status: string) => void)[] = [];
let retryCount = 0;

const notifyStatus = (status: string) => {
    console.log(`📡 [RadioStatus] ${status}`);
    statusListeners.forEach(l => l(status));
};

const localChannel = typeof window !== 'undefined' ? new BroadcastChannel('radio-local-fallback') : null;

if (localChannel) {
    localChannel.onmessage = (event) => {
        console.log('📡 [Local] Message via BroadcastChannel:', event.data);
        if (event.data?.type === 'broadcast' && event.data?.event === 'live_greeting') {
            listeners.forEach(cb => cb(event.data.payload));
        }
    };
}

// Inicializar canal (Singleton con Reintento)
const getChannel = () => {
    if (radioChannel && (radioChannel.state === 'joined' || radioChannel.state === 'joining')) {
        return radioChannel;
    }

    if (radioChannel) {
        console.log('🧹 [Radio] Cleaning old channel...');
        supabase.removeChannel(radioChannel);
    }

    console.log(`📡 [Radio] Connecting to Channel: ${RADIO_EVENTS_CHANNEL}...`);

    radioChannel = supabase.channel(RADIO_EVENTS_CHANNEL, {
        config: { broadcast: { self: true } }
    });

    radioChannel
        .on('broadcast', { event: 'live_greeting' }, (payload: any) => {
            console.log('🗣️ [Radio] Global Event:', payload);
            listeners.forEach(cb => cb(payload.payload));
        })
        .subscribe(async (status: string, err: any) => {
            notifyStatus(status);

            if (status === 'SUBSCRIBED') {
                console.log('✅ RADIO ONLINE');
                retryCount = 0;
            } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED' || status === 'TIMED_OUT') {
                console.error(`❌ Radio Error: ${status}`, err);
                notifyStatus('LOCAL_MODE');

                if (retryCount < 10) {
                    retryCount++;
                    const delay = Math.min(1000 * Math.pow(1.5, retryCount), 15000);
                    console.log(`🔄 Reintento #${retryCount} en ${Math.round(delay / 1000)}s...`);
                    setTimeout(() => getChannel(), delay);
                }
            }
        });

    return radioChannel;
};

// Enviar saludo
export const broadcastGreeting = async (greeting: any) => {
    const channel = getChannel();
    let sentViaSupabase = false;

    if (channel.state !== 'joined') {
        channel.subscribe();
    }

    try {
        const resp = await Promise.race([
            channel.send({
                type: 'broadcast',
                event: 'live_greeting',
                payload: greeting
            }),
            new Promise((_, reject) => setTimeout(() => reject(new Error('TIMEOUT')), 5000))
        ]);

        if (resp === 'ok') {
            sentViaSupabase = true;
            console.log('✅ Sent via Supabase');
        }
    } catch (err) {
        console.warn('❌ Supabase broadcast error:', err);
    }

    // Fallback local
    if (localChannel) {
        localChannel.postMessage({
            type: 'broadcast',
            event: 'live_greeting',
            payload: greeting
        });
    }

    if (!sentViaSupabase) {
        notifyStatus('LOCAL_MODE');
    } else {
        notifyStatus('SUBSCRIBED');
    }

    return sentViaSupabase;
};

export const subscribeToRadioEvents = (callback: (payload: any) => void) => {
    listeners.push(callback);
    getChannel();
    return () => {
        listeners = listeners.filter(l => l !== callback);
    };
};

export const onRadioConnectionChange = (callback: (status: string) => void) => {
    statusListeners.push(callback);
    if (radioChannel) {
        callback(radioChannel.state === 'joined' ? 'SUBSCRIBED' : radioChannel.state);
    } else {
        callback('CONNECTING');
    }
    return () => {
        statusListeners = statusListeners.filter(l => l !== callback);
    };
};
