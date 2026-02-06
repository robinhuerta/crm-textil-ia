
import React, { useRef, useEffect, useState } from 'react';
import { RADIO_STREAM_URL } from '../constants';
import { Logo } from './Logo.tsx';

interface PlayerBarProps {
  isPlaying: boolean;
  onPlayToggle: () => void;
}

const PlayerBar: React.FC<PlayerBarProps> = ({ isPlaying, onPlayToggle }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const loadedSourceRef = useRef<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  const [volume, setVolume] = useState(() => {
    const saved = localStorage.getItem('radio_user_volume');
    return saved ? parseFloat(saved) : 0.8;
  });

  const [playerState, setPlayerState] = useState<{
    source: string;
    title: string;
    artist: string;
    isLive: boolean;
  }>(() => {
    const mainUrl = localStorage.getItem('radio_url_main_config') || RADIO_STREAM_URL;
    return {
      source: localStorage.getItem('radio_stream_url_active') || mainUrl,
      title: "La Nueva 5:40",
      artist: "Radio en Vivo",
      isLive: true
    };
  });

  const goBackToLive = () => {
    const mainUrl = localStorage.getItem('radio_url_main_config') || RADIO_STREAM_URL;
    const newState = {
      source: mainUrl,
      title: "La Nueva 5:40",
      artist: "Radio en Vivo",
      isLive: true
    };
    setPlayerState(newState);
    localStorage.setItem('radio_stream_url_active', mainUrl);
    window.dispatchEvent(new Event('radio_url_changed'));
    if (!isPlaying) onPlayToggle();
  };

  useEffect(() => {
    const handleUrlChange = () => {
      const main = localStorage.getItem('radio_url_main_config') || RADIO_STREAM_URL;
      const newUrl = localStorage.getItem('radio_stream_url_active') || main;
      setPlayerState(prev => ({
        ...prev,
        source: newUrl,
        title: "La Nueva 5:40",
        artist: "Radio en Vivo",
        isLive: true
      }));
      setHasError(false);
      setIsLoading(true);
    };

    const handlePlayTrack = (e: any) => {
      const { track } = e.detail;
      setPlayerState({
        source: track.url,
        title: track.title,
        artist: track.artist,
        isLive: false
      });
      setHasError(false);
      setIsLoading(true);
      if (!isPlaying) onPlayToggle();
    };

    const handleVolumeEvent = (e: any) => {
      const { level } = e.detail;
      setVolume(level);
      if (audioRef.current) audioRef.current.volume = level;
    };

    // Ducking: lower volume when AI speaks
    let savedVolume = volume;
    const handleDuck = (e: any) => {
      if (e.detail.duck) {
        savedVolume = audioRef.current?.volume || volume;
        const duckedVolume = savedVolume * 0.2; // Lower to 20% of current
        if (audioRef.current) audioRef.current.volume = duckedVolume;
      } else {
        if (audioRef.current) audioRef.current.volume = savedVolume;
      }
    };

    window.addEventListener('radio_url_changed', handleUrlChange);
    window.addEventListener('play_specific_track', handlePlayTrack);
    window.addEventListener('radio_volume_change', handleVolumeEvent);
    window.addEventListener('radio_volume_duck', handleDuck);

    return () => {
      window.removeEventListener('radio_url_changed', handleUrlChange);
      window.removeEventListener('play_specific_track', handlePlayTrack);
      window.removeEventListener('radio_volume_change', handleVolumeEvent);
      window.removeEventListener('radio_volume_duck', handleDuck);
    };
  }, [isPlaying, onPlayToggle, volume]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const playAudio = async () => {
      try {
        const cleanSource = playerState.source.replace(/\.m3u$/, '');
        if (loadedSourceRef.current !== cleanSource) {
          audio.src = cleanSource;
          loadedSourceRef.current = cleanSource;
          audio.load();
        }
        audio.volume = volume;
        await audio.play();
      } catch (err) {
        console.warn("Autoplay bloqueado o error de carga.");
        setIsLoading(false);
        // No marcamos error de inmediato porque el usuario puede darle Play manual
      }
    };

    if (isPlaying) {
      playAudio();
    } else {
      audio.pause();
      if (playerState.isLive) {
        audio.removeAttribute('src');
        loadedSourceRef.current = "";
        audio.load();
      }
    }
  }, [isPlaying, playerState.source, volume, playerState.isLive]);

  return (
    <div className="fixed bottom-[88px] lg:bottom-0 left-4 right-4 lg:left-72 lg:right-0 glass-dark border border-white/10 rounded-[2rem] lg:rounded-none lg:border-t p-3 md:p-4 z-[110] shadow-[0_20px_60px_rgba(0,0,0,0.8)]">
      <audio
        ref={audioRef}
        preload="auto"
        crossOrigin="anonymous"
        onPlaying={() => { setIsLoading(false); setHasError(false); }}
        onWaiting={() => setIsLoading(true)}
        onError={() => { setIsLoading(false); setHasError(true); }}
      />
      <div className="max-w-screen-xl mx-auto flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 flex-1 overflow-hidden">
          <div className="relative w-10 h-10 md:w-14 md:h-14 bg-slate-900 rounded-xl p-2 border border-white/10 flex-shrink-0 flex items-center justify-center">
            <Logo isIcon={true} className={`w-7 h-7 md:w-10 md:h-10 ${isPlaying && !isLoading && !hasError ? 'animate-spin-slow' : ''}`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${hasError ? 'bg-red-500' : isPlaying ? (playerState.isLive ? 'bg-[#a3cf33]' : 'bg-blue-400') : 'bg-slate-700'} animate-pulse`}></span>
              <span className="text-[7px] md:text-[8px] font-black uppercase tracking-widest text-slate-400 truncate">
                {hasError ? "ERROR DE SEÑAL" : isLoading ? "SINTONIZANDO..." : playerState.isLive ? "RADIO EN VIVO" : "REPRODUCIENDO MP3"}
              </span>
            </div>
            <h3 className="text-white font-black text-[10px] md:text-xs uppercase truncate">{playerState.title}</h3>
            <p className="text-[#a3cf33] text-[8px] md:text-[9px] font-bold uppercase truncate opacity-80">{playerState.artist}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!playerState.isLive && (
            <button
              onClick={goBackToLive}
              className="hidden md:flex px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black text-white uppercase tracking-widest hover:bg-[#a3cf33] hover:text-black transition-all"
            >
              Volver al Aire
            </button>
          )}

          <button
            onClick={onPlayToggle}
            className={`w-12 h-12 md:w-16 md:h-16 rounded-full flex items-center justify-center transition-all shadow-2xl ${isPlaying ? 'bg-white text-black' : 'bg-[#a3cf33] text-black'
              } active:scale-90`}
          >
            <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play ml-1'} text-base md:text-2xl`}></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PlayerBar;
