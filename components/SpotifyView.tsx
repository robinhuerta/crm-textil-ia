
import React, { useState } from 'react';
import { SPOTIFY_PROFILE_URL, SLOGAN } from '../constants';

const SpotifyView: React.FC = () => {
  const [activePlaylist, setActivePlaylist] = useState<string | null>(null);

  const playlists = [
    {
      id: '4QXwCvxZcwpGR6jJkeFGsI',
      name: 'Cumbia Peruana',
      color: '#a3cf33',
      img: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&q=80&w=600'
    },
    {
      id: '3oT7OtxdAjbD2yugPupEZ5',
      name: 'Salsa del Barrio',
      color: '#3fb4e5',
      img: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?auto=format&fit=crop&q=80&w=600'
    }
  ];

  return (
    <div className="space-y-10 animate-fadeIn pb-40 max-w-2xl mx-auto px-4">
      {/* BOTON PERFIL OFICIAL - PRIORIDAD 1 */}
      <section className="relative group">
        <div className="absolute -inset-1 bg-gradient-to-r from-[#1DB954] to-[#a3cf33] rounded-[3rem] blur opacity-25 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
        <a
          href={SPOTIFY_PROFILE_URL}
          target="_blank"
          rel="noreferrer"
          className="relative flex flex-col items-center justify-center p-12 bg-black rounded-[3rem] border border-white/10 text-center gap-6"
        >
          <i className="fa-brands fa-spotify text-7xl text-[#1DB954]"></i>
          <div className="space-y-2">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Perfil Oficial <span className="text-[#1DB954]">Spotify</span></h2>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-[0.4em]">Toca para seguir a La Nueva 5:40</p>
          </div>
          <div className="px-8 py-3 bg-[#1DB954] text-black font-black rounded-full text-[10px] uppercase tracking-widest shadow-xl">
            Abrir en Spotify
          </div>
        </a>
      </section>

      {/* PLAYLISTS */}
      <section className="space-y-6">
        <h3 className="text-white font-black uppercase text-xs tracking-widest text-center">Nuestras Colecciones</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {playlists.map((pl) => (
            <div
              key={pl.id}
              onClick={() => {
                window.dispatchEvent(new CustomEvent('stop_radio_signal'));
                setActivePlaylist(pl.id);
              }}
              className="group relative aspect-video rounded-[2.5rem] overflow-hidden border border-white/5 cursor-pointer"
            >
              <img src={pl.img} className="absolute inset-0 w-full h-full object-cover opacity-50 group-hover:opacity-80 transition-opacity" alt="" />
              <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent"></div>
              <div className="absolute inset-0 p-8 flex flex-col justify-end">
                <h4 className="text-white font-black text-lg uppercase">{pl.name}</h4>
                <div className="w-8 h-8 bg-[#1DB954] rounded-full flex items-center justify-center text-black mt-3 opacity-0 group-hover:opacity-100 transition-all">
                  <i className="fa-solid fa-play text-xs ml-0.5"></i>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {activePlaylist && (
        <div className="fixed inset-0 z-[600] flex items-center justify-center p-4 md:p-12 animate-fadeIn">
          <div className="absolute inset-0 bg-black/95 backdrop-blur-xl" onClick={() => setActivePlaylist(null)}></div>
          <div className="relative w-full max-w-lg bg-[#121212] rounded-[3rem] overflow-hidden border border-[#1DB954]/20 shadow-2xl">
            <div className="p-6 flex justify-between items-center bg-[#1DB954]">
              <span className="text-[10px] font-black text-black uppercase tracking-widest">Preview 5:40</span>
              <button onClick={() => setActivePlaylist(null)} className="text-black text-xl"><i className="fa-solid fa-xmark"></i></button>
            </div>
            <iframe
              src={`https://open.spotify.com/embed/playlist/${activePlaylist}?utm_source=generator&theme=0`}
              width="100%"
              height="400"
              frameBorder="0"
              allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
              loading="lazy"
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpotifyView;
