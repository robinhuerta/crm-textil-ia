
import React, { useState, useEffect } from 'react';
import { MOCK_VIDEOS, YOUTUBE_CHANNEL_URL } from '../constants';
import { YouTubeVideo } from '../types';

// Construye la URL de embed correctamente, manejando playlists (que ya tienen '?' en el videoId)
const getEmbedUrl = (videoId: string, autoplay: boolean): string => {
  const base = `https://www.youtube.com/embed/${videoId}`;
  const sep = videoId.includes('?') ? '&' : '?';
  return `${base}${sep}rel=0&modestbranding=1${autoplay ? '&autoplay=1' : ''}`;
};

const VideoView: React.FC = () => {
  const [videos, setVideos] = useState<YouTubeVideo[]>([]);
  const [selected, setSelected] = useState<YouTubeVideo | null>(null);
  const [autoplay, setAutoplay] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('radio_videos');
    const list = saved ? JSON.parse(saved) : MOCK_VIDEOS;
    setVideos(list);
    if (list.length > 0) setSelected(list[0]);

    // Pausar radio al entrar a la vista de videos
    window.dispatchEvent(new CustomEvent('radio_playback_control', { detail: { action: 'pause' } }));

    // Reanudar radio al salir de la vista
    return () => {
      window.dispatchEvent(new CustomEvent('radio_playback_control', { detail: { action: 'play' } }));
    };
  }, []);

  const handleSelectVideo = (v: YouTubeVideo) => {
    setSelected(v);
    setAutoplay(true);
    window.dispatchEvent(new CustomEvent('radio_playback_control', { detail: { action: 'pause' } }));
  };

  return (
    <div className="space-y-10 animate-fadeIn pb-20">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="text-center md:text-left">
          <h2 className="text-4xl font-black text-white uppercase tracking-tight">5:40 <span className="text-[#a3cf33]">TV</span></h2>
          <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.5em] mt-2">La radio en imagen</p>
        </div>
        <a href={YOUTUBE_CHANNEL_URL} target="_blank" rel="noreferrer" className="px-8 py-4 bg-red-600 text-white text-[10px] font-black rounded-2xl uppercase tracking-widest shadow-xl flex items-center gap-2">
          <i className="fa-brands fa-youtube text-xl"></i>
          Canal Oficial
        </a>
      </header>

      {selected && (
        <section className="aspect-video w-full rounded-[3rem] overflow-hidden bg-black border border-white/10 shadow-2xl">
          <iframe
            key={selected.id}
            src={getEmbedUrl(selected.videoId, autoplay)}
            title={selected.title}
            className="w-full h-full"
            style={{ border: 'none' }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          ></iframe>
        </section>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {videos.map((v) => (
          <div
            key={v.id}
            onClick={() => handleSelectVideo(v)}
            className={`cursor-pointer glass-dark rounded-2xl overflow-hidden border border-white/5 transition-all ${selected?.id === v.id ? 'border-[#a3cf33] scale-105' : 'opacity-60 hover:opacity-100'}`}
          >
            <img src={v.thumbnail} className="w-full aspect-video object-cover" alt={v.title} />
            <div className="p-4">
              <h4 className="text-white font-bold text-[10px] uppercase truncate">{v.title}</h4>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default VideoView;
