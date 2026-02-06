
import React, { useState, useEffect } from 'react';
import { MOCK_TRACKS } from '../constants';
import { MusicTrack, NavTab } from '../types';

const MusicLibraryView: React.FC = () => {
  const [tracks, setTracks] = useState<MusicTrack[]>([]);

  useEffect(() => {
    const loadTracks = () => {
      const savedTracks = localStorage.getItem('radio_tracks');
      setTracks(savedTracks ? JSON.parse(savedTracks) : MOCK_TRACKS);
    };
    loadTracks();
    window.addEventListener('radio_content_updated', loadTracks);
    return () => window.removeEventListener('radio_content_updated', loadTracks);
  }, []);

  const playTrack = (track: MusicTrack) => {
    window.dispatchEvent(new CustomEvent('play_specific_track', { detail: { track } }));
  };

  const goToUpload = () => {
    window.dispatchEvent(new CustomEvent('navigate_to_tab', { detail: NavTab.SETTINGS }));
    // Pequeño hack para forzar la pestaña de música en settings si fuera necesario
    localStorage.setItem('settings_last_tab', 'music');
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-32 max-w-4xl mx-auto px-4">
      <header className="flex flex-col md:flex-row items-center justify-between gap-6 glass p-8 rounded-[3rem] border border-white/10 shadow-2xl bg-gradient-to-br from-[#E0E0E0]/5 to-transparent">
        <div className="flex items-center gap-6">
          <div className="w-20 h-20 bg-white/10 rounded-3xl flex items-center justify-center shadow-xl flex-shrink-0 rotate-3">
            <i className="fa-solid fa-compact-disc text-3xl text-slate-300 animate-spin-slow"></i>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl md:text-5xl font-black text-white tracking-normal uppercase leading-tight">Biblioteca <span className="text-[#E0E0E0]">MP3</span></h2>
            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-2">Música del Recuerdo • Sin Cortes</p>
          </div>
        </div>

        <button
          onClick={goToUpload}
          className="px-6 py-4 bg-white/5 border border-white/10 hover:bg-white/20 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-3 shadow-xl"
        >
          <i className="fa-solid fa-cloud-arrow-up text-lg"></i>
          Gestionar MP3
        </button>
      </header>

      <div className="space-y-4">
        {tracks.length === 0 ? (
          <div className="text-center py-24 glass rounded-[3rem] border border-dashed border-white/10">
            <i className="fa-solid fa-music text-6xl mb-6 text-slate-800"></i>
            <p className="text-xs font-black uppercase tracking-widest text-slate-500">Aún no hay música cargada</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {tracks.map((track, index) => (
              <div
                key={track.id}
                onClick={() => playTrack(track)}
                className="group glass p-5 rounded-[2rem] flex items-center gap-5 cursor-pointer border border-white/5 hover:bg-white/10 transition-all active:scale-98"
              >
                <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center text-slate-500 font-black group-hover:bg-blue-500 group-hover:text-white transition-all">
                  <i className="fa-solid fa-play ml-1"></i>
                </div>

                <div className="flex-1 min-w-0">
                  <h4 className="text-white font-bold text-sm uppercase truncate">{track.title}</h4>
                  <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest truncate mt-1">{track.artist}</p>
                </div>

                <span className="text-[9px] font-black text-slate-700 uppercase">HQ AUDIO</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MusicLibraryView;
