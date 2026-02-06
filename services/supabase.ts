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
