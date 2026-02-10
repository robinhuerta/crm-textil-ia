
export enum NavTab {
  HOME = 'home',
  VIDEOS = 'videos',
  SHORTS = 'shorts',
  EVENTS = 'events',
  CHAT = 'chat',
  SETTINGS = 'settings',
  MUSIC = 'music',
  POLLS = 'polls',
  SPOTIFY = 'spotify',
  GREETINGS = 'greetings'
}

export interface RadioEvent {
  id: string;
  title: string;
  date: string;
  location: string;
  imageUrl: string;
  description?: string;
}

export interface YouTubeVideo {
  id: string;
  title: string;
  thumbnail: string;
  videoId: string;
}

export interface RadioShort {
  id: string;
  title: string;
  videoUrl: string;
  thumbnail: string;
}

export interface MusicTrack {
  id: string;
  title: string;
  artist: string;
  url: string; // URL del archivo MP3
}

export interface RadioPollOption {
  id: string;
  text: string;
  votes: number;
}

export interface RadioPoll {
  id: string;
  question: string;
  totalVotes: number;
  options: RadioPollOption[];
}

export interface LiveGreeting {
  id: string;
  from: string;      // De parte de
  to: string;        // Para quién
  message?: string;  // Mensaje opcional
  status: 'pending' | 'reading' | 'completed' | 'rejected';
  timestamp: string;
}
