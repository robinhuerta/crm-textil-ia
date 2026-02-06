
import React, { useState, useEffect, useRef } from 'react';
import { RadioShort } from '../types';
import { MOCK_SHORTS } from '../constants';

// Datos de cumpleañeros
const BIRTHDAY_GREETINGS = [
  {
    id: 'birthday-ana-mitma',
    name: 'Ana Mitma Quispe',
    image: 'https://i.postimg.cc/76rTMyk2/v.jpg',
    message: '¡Felicidades en tu día especial!',
    dj1: 'DJ Principal',
    dj2: 'DJ Asistente'
  }
];

const ShortsView: React.FC = () => {
  const [shorts, setShorts] = useState<RadioShort[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const wasPlayingRef = useRef(false);
  const [showBirthdays, setShowBirthdays] = useState(true);

  const loadShorts = () => {
    const saved = localStorage.getItem('radio_shorts');
    setShorts(saved ? JSON.parse(saved) : MOCK_SHORTS);
  };

  useEffect(() => {
    loadShorts();
    window.addEventListener('radio_content_updated', loadShorts);

    // Guardar estado actual de reproducción y pausar radio
    wasPlayingRef.current = true; // Asumimos que estaba sonando
    window.dispatchEvent(new CustomEvent('radio_playback_control', { detail: { action: 'pause' } }));

    // Cleanup: Restaurar radio al salir del componente
    return () => {
      window.removeEventListener('radio_content_updated', loadShorts);
      if (wasPlayingRef.current) {
        window.dispatchEvent(new CustomEvent('radio_playback_control', { detail: { action: 'play' } }));
      }
    };
  }, []);

  const getEmbedUrl = (url: string, index: number) => {
    const isActive = index === activeIndex;
    let videoId = "";
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
      videoId = url.split('v=')[1]?.split('&')[0] || url.split('/').pop() || "";
    }
    return `https://www.youtube.com/embed/${videoId}?autoplay=${isActive ? 1 : 0}&controls=0&modestbranding=1&rel=0&mute=0&loop=1&playlist=${videoId}`;
  };

  return (
    <div className="h-[calc(100vh-80px)] overflow-y-scroll snap-y snap-mandatory no-scrollbar bg-black">
      {/* 🎂 SECCIÓN DE SALUDOS DE CUMPLEAÑOS */}
      {showBirthdays && BIRTHDAY_GREETINGS.map((birthday) => (
        <div
          key={birthday.id}
          className="relative w-full h-full snap-start flex flex-col bg-gradient-to-br from-slate-950 via-purple-950/40 to-pink-950/30 overflow-hidden"
        >
          {/* Fondo decorativo con confeti animado */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {/* Confeti particles */}
            {[...Array(30)].map((_, i) => (
              <div
                key={i}
                className="absolute w-3 h-3 rounded-full animate-bounce"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  backgroundColor: ['#a3cf33', '#FFD700', '#FF69B4', '#00E5FF', '#FF5252', '#E040FB'][i % 6],
                  animationDuration: `${1 + Math.random() * 2}s`,
                  animationDelay: `${Math.random() * 2}s`,
                  opacity: 0.6
                }}
              />
            ))}
            {/* Glow effects */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-pink-500/20 rounded-full blur-[120px] animate-pulse"></div>
            <div className="absolute bottom-0 left-0 w-80 h-80 bg-[#a3cf33]/20 rounded-full blur-[100px] animate-pulse"></div>
          </div>

          {/* Contenido principal */}
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center h-full gap-8 p-6 lg:p-12">

            {/* Imagen del cumpleañero */}
            <div className="relative group flex-shrink-0">
              <div className="absolute -inset-4 bg-gradient-to-r from-pink-500 via-[#a3cf33] to-yellow-400 rounded-full blur-xl opacity-60 animate-pulse group-hover:opacity-80 transition-opacity"></div>
              <div className="relative w-48 h-48 lg:w-64 lg:h-64 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
                <img
                  src={birthday.image}
                  alt={birthday.name}
                  className="w-full h-full object-cover"
                />
              </div>
              {/* Corona/Gorro de cumpleaños */}
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-5xl animate-bounce">🎂</div>
            </div>

            {/* Mensaje de felicitación */}
            <div className="text-center lg:text-left space-y-6 max-w-lg">
              <div className="space-y-2">
                <span className="bg-gradient-to-r from-pink-500 to-[#a3cf33] text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-xl inline-block animate-pulse">
                  🎉 ¡Feliz Cumpleaños! 🎉
                </span>
                <h2 className="text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-tight">
                  {birthday.name}
                </h2>
                <p className="text-pink-300 text-sm font-bold">{birthday.message}</p>
              </div>

              {/* Diálogo de locutores */}
              <div className="space-y-4 bg-black/40 backdrop-blur-sm rounded-3xl p-5 border border-white/10">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#a3cf33] rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-microphone text-black text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-[#a3cf33] text-[10px] font-black uppercase tracking-wider mb-1">{birthday.dj1}</p>
                    <p className="text-white text-sm leading-relaxed">
                      ¡Oeeeee mi gente bonita de La Nueva 5:40! 🎤 ¡Miren quién está de cumpleaños hoy! Ni más ni menos que nuestra querida amiga y familia <span className="text-pink-400 font-black">ANA MITMA QUISPE</span>... ¡Fuego causa, qué día tan especial! 🔥
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-headphones text-white text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-pink-400 text-[10px] font-black uppercase tracking-wider mb-1">{birthday.dj2}</p>
                    <p className="text-white text-sm leading-relaxed">
                      ¡Habla batería! 🎧 Así es pues causa, hoy mandamos los saluditos más chéveres para Ana, que siempre nos sintoniza desde tempranito. ¡Que la pasen lindo con toda la familia, que no falte la torta y la música! 🎂🎶
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-[#a3cf33] rounded-full flex items-center justify-center flex-shrink-0">
                    <i className="fa-solid fa-microphone text-black text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-[#a3cf33] text-[10px] font-black uppercase tracking-wider mb-1">{birthday.dj1}</p>
                    <p className="text-white text-sm leading-relaxed">
                      ¡Exacto mi broder! 💪 Y para ti Anita, que Dios te bendiga con mucha salud, amor y éxitos en este nuevo año de vida. ¡Que todos tus sueños se hagan realidad! De parte de toda la familia de La Nueva 5:40 Radio... <span className="text-yellow-400 font-black">¡FELIZ CUMPLEAÑOS! 🥳🎊</span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Nota de amor */}
              <div className="flex items-center justify-center lg:justify-start gap-2 text-slate-400 text-[9px] font-bold uppercase tracking-widest">
                <span className="animate-pulse">❤️</span>
                <span>Con mucho cariño de tu radio favorita</span>
                <span className="animate-pulse">❤️</span>
              </div>
            </div>
          </div>

          {/* Badge de publicidad */}
          <div className="absolute top-6 left-6 z-20">
            <span className="bg-gradient-to-r from-[#a3cf33] to-yellow-400 text-black px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-2xl inline-flex items-center gap-2">
              <i className="fa-solid fa-cake-candles"></i>
              Saluditos 5:40
            </span>
          </div>

          {/* Indicador de scroll */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce">
            <span className="text-slate-500 text-[8px] font-bold uppercase tracking-widest">Desliza para más</span>
            <i className="fa-solid fa-chevron-down text-[#a3cf33]"></i>
          </div>
        </div>
      ))}

      {/* Publicidad Regular */}
      {shorts.length === 0 && !showBirthdays ? (
        <div className="h-full flex items-center justify-center text-slate-700 flex-col gap-4">
          <i className="fa-solid fa-film text-4xl"></i>
          <p className="text-[10px] font-black uppercase tracking-widest">Sin publicidad activa</p>
        </div>
      ) : (
        shorts.map((short, index) => (
          <div
            key={short.id}
            onMouseEnter={() => setActiveIndex(index)}
            className="relative w-full h-full snap-start flex flex-col bg-black overflow-hidden"
          >
            <div className="absolute inset-0">
              {short.videoUrl ? (
                <iframe
                  src={getEmbedUrl(short.videoUrl, index)}
                  className="w-full h-full"
                  frameBorder="0"
                  allow="autoplay; encrypted-media"
                ></iframe>
              ) : (
                <img
                  src={short.thumbnail}
                  alt={short.title}
                  className="w-full h-full object-contain bg-black"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-black/90 pointer-events-none"></div>
            </div>

            <div className="absolute bottom-12 left-0 right-0 p-8 z-20 space-y-4 pointer-events-none">
              <span className="bg-[#a3cf33] text-black px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-2xl inline-block">Publicidad 5:40</span>
              <h3 className="text-3xl font-black text-white uppercase tracking-tighter drop-shadow-2xl">{short.title}</h3>
            </div>

            {/* Indicador de Swipe */}
            <div className="absolute right-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-30">
              <div className="w-1.5 h-16 bg-white/10 rounded-full overflow-hidden">
                <div className="w-full bg-[#a3cf33] transition-all duration-500" style={{ height: `${((index + 1) / shorts.length) * 100}%` }}></div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default ShortsView;
