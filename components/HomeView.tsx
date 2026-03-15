import React, { useState, useEffect } from 'react';
import { WHATSAPP_URL, TIKTOK_URL, FACEBOOK_URL, RADIO_STREAM_URL, RADIO_STREAM_ROCK, RADIO_STREAM_CUMBIAS, RADIO_STREAM_HUAYNOS, GREETINGS_WHATSAPP, RADIO_STREAM_SALSA, RADIO_STREAM_VALLENATOS, RADIO_STREAM_BALADAS, RADIO_STREAM_FIESTA } from '../constants';
import { NavTab } from '../types';

interface HomeViewProps {
  onPlayToggle: () => void;
  isPlaying: boolean;
}

const HomeView: React.FC<HomeViewProps> = ({ onPlayToggle, isPlaying }) => {
  const [activeStream, setActiveStream] = useState<string>(() => localStorage.getItem('radio_stream_url_active') || RADIO_STREAM_URL);
  const [peruTime, setPeruTime] = useState<string>('');
  const [peruDate, setPeruDate] = useState<string>('');

  // Reloj en tiempo real - Hora Peruana (UTC-5)
  useEffect(() => {
    const updatePeruTime = () => {
      const now = new Date();
      // Convertir a hora peruana (UTC-5)
      const peruOffset = -5 * 60; // -5 horas en minutos
      const localOffset = now.getTimezoneOffset();
      const peruTimeMs = now.getTime() + (localOffset + peruOffset) * 60 * 1000;
      const peruDate = new Date(peruTimeMs);

      const hours = peruDate.getHours().toString().padStart(2, '0');
      const minutes = peruDate.getMinutes().toString().padStart(2, '0');
      const seconds = peruDate.getSeconds().toString().padStart(2, '0');

      setPeruTime(`${hours}:${minutes}:${seconds}`);

      const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
      const meses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
      setPeruDate(`${dias[peruDate.getDay()]} ${peruDate.getDate()} de ${meses[peruDate.getMonth()]}`);
    };

    updatePeruTime(); // Ejecutar inmediatamente
    const interval = setInterval(updatePeruTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const switchStream = (url: string) => {
    setActiveStream(url);
    localStorage.setItem('radio_stream_url_active', url);
    window.dispatchEvent(new Event('radio_url_changed'));
  };


  const pedirCancion = () => {
    const msg = encodeURIComponent("¡Habla La Nueva 5:40! Quiero pedir un temita para el barrio...");
    window.open(`${WHATSAPP_URL}?text=${msg}`, '_blank');
  };

  const navigateToGreetings = () => {
    window.dispatchEvent(new CustomEvent('navigate_to_tab', { detail: NavTab.GREETINGS }));
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-fadeIn">
      {/* BANNER SALUDITOS EN VIVO */}
      <section className="relative overflow-hidden rounded-[2rem] md:rounded-[3rem] p-6 md:p-8">
        <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 via-[#10B981]/10 to-emerald-600/20 animate-gradient"></div>
        <div className="absolute inset-0 backdrop-blur-3xl border border-green-500/20 rounded-[2rem] md:rounded-[3rem]"></div>

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-600/30 to-emerald-600/30 border border-green-500/40 rounded-full text-green-200 text-[9px] font-black uppercase tracking-[0.3em] backdrop-blur-xl mb-3">
              <i className="fa-solid fa-sparkles animate-pulse"></i>
              Nuevo
            </div>
            <h3 className="text-white font-black text-2xl md:text-3xl uppercase mb-2">
              ¡Saluditos <span className="bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">Al Aire!</span>
            </h3>
            <p className="text-slate-400 text-sm md:text-base max-w-lg">
              📱 Envía tu saludo por WhatsApp y lo leeremos al aire con voz AI profesional
            </p>
          </div>

          <div className="flex items-center justify-center w-full md:w-auto">
            <a
              href={`${GREETINGS_WHATSAPP}?text=${encodeURIComponent("¡Hola! 👋 Bienvenido a La Nueva 5:40.\n\nTu saludo ya está en cola para ser leído por nuestra IA. 🤖\n\n⚠️ Ojo: Por favor escribe solo TEXTO, no envíes audios.\n\nEscúchanos en vivo aquí: 👇\n🔗 https://radioficial540.netlify.app/")}`}
              target="_blank"
              rel="noreferrer"
              className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-[#25D366] to-[#20bd5a] text-white font-black rounded-2xl text-base uppercase tracking-widest hover:shadow-2xl hover:shadow-green-500/50 transition-all hover:scale-105 active:scale-95"
            >
              <i className="fa-brands fa-whatsapp text-xl"></i>
              <div className="text-left">
                <p className="text-xs opacity-80">Envía tu saludo al</p>
                <p className="text-lg">933-067-069</p>
              </div>
            </a>
          </div>
        </div>
      </section>

      {/* SECTOR ESTACIONES */}
      <section className="glass-dark p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/5 space-y-6 md:space-y-8 shadow-2xl">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6 border-b border-white/5 pb-6">
          <div className="text-center lg:text-left">
            <h3 className="text-white font-black text-xs md:text-sm uppercase tracking-[0.3em] mb-1">Tu frecuencia 5:40</h3>
            <p className="text-slate-500 text-[9px] md:text-[10px] font-bold uppercase tracking-widest">Elige qué quieres escuchar ahora</p>
          </div>

          {/* RELOJ HORA PERUANA */}
          <div className="flex-1 flex flex-col items-center justify-center px-4">
            <div className="bg-gradient-to-r from-[#a3cf33]/10 to-orange-500/10 border border-white/10 rounded-2xl px-6 py-3 text-center">
              <p className="text-[#a3cf33] font-mono text-3xl md:text-4xl lg:text-5xl font-bold tracking-wider">
                {peruTime || '--:--:--'}
              </p>
              <p className="text-slate-400 text-[8px] md:text-[9px] font-bold uppercase tracking-widest mt-1">
                {peruDate || 'Cargando...'} • Hora Perú
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.5em] text-center lg:text-left mb-2">Señales Disponibles</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <StreamBtn label="Principal" icon="fa-tower-broadcast" active={activeStream === RADIO_STREAM_URL} color="bg-[#a3cf33]" onClick={() => switchStream(RADIO_STREAM_URL)} />
            <StreamBtn label="Fiesta" icon="fa-glass-cheers" active={activeStream === RADIO_STREAM_FIESTA} color="bg-amber-500" onClick={() => switchStream(RADIO_STREAM_FIESTA)} />
            <StreamBtn label="Cumbias" icon="fa-music" active={activeStream === RADIO_STREAM_CUMBIAS} color="bg-[#3fb4e5]" onClick={() => switchStream(RADIO_STREAM_CUMBIAS)} />
            <StreamBtn label="Salsa" icon="fa-drum" active={activeStream === RADIO_STREAM_SALSA} color="bg-indigo-500" onClick={() => switchStream(RADIO_STREAM_SALSA)} />
            <StreamBtn label="Vallenatos" icon="fa-microphone-lines" active={activeStream === RADIO_STREAM_VALLENATOS} color="bg-yellow-500" onClick={() => switchStream(RADIO_STREAM_VALLENATOS)} />
            <StreamBtn label="Rock" icon="fa-guitar" active={activeStream === RADIO_STREAM_ROCK} color="bg-red-500" onClick={() => switchStream(RADIO_STREAM_ROCK)} />
            <StreamBtn label="Baladas" icon="fa-heart" active={activeStream === RADIO_STREAM_BALADAS} color="bg-rose-500" onClick={() => switchStream(RADIO_STREAM_BALADAS)} />
            <StreamBtn label="Huaynos" icon="fa-compact-disc" active={activeStream === RADIO_STREAM_HUAYNOS} color="bg-orange-500" onClick={() => switchStream(RADIO_STREAM_HUAYNOS)} />
          </div>
        </div>
      </section >

      {/* HERO PLAYER */}
      < section className="bg-gradient-to-br from-[#0a0f1a] to-black rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-14 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 shadow-2xl overflow-hidden relative group" >
        <div className="absolute -top-20 -right-20 w-80 h-80 bg-[#a3cf33]/5 blur-[100px] rounded-full group-hover:bg-[#a3cf33]/10 transition-all duration-1000"></div>
        <div className="text-center md:text-left space-y-4 md:space-y-6 z-10">
          <h2 className="text-4xl md:text-6xl lg:text-7xl font-black text-white uppercase tracking-tighter leading-none">
            La que <br className="hidden md:block" /><span className="text-[#a3cf33]">manda</span><br />en el barrio
          </h2>
          <p className="text-slate-500 text-[10px] md:text-xs font-bold uppercase tracking-[0.4em] opacity-80">Sintonía Oficial Digital</p>
        </div>
        <button
          onClick={onPlayToggle}
          className={`w-28 h-28 md:w-36 md:h-36 lg:w-44 lg:h-44 rounded-full flex items-center justify-center transition-all duration-700 z-10 shadow-2xl ${isPlaying ? 'bg-slate-900 text-[#a3cf33] border-4 border-[#a3cf33] scale-105' : 'bg-[#a3cf33] text-slate-900 hover:scale-105 active:scale-90'}`}
        >
          <i className={`fa-solid ${isPlaying ? 'fa-pause' : 'fa-play ml-2'} text-3xl md:text-5xl lg:text-6xl`}></i>
        </button>
      </section >

      {/* SOCIAL GRID */}
      < div className="grid grid-cols-2 lg:grid-cols-4 gap-4" >
        <SocialCard icon="fa-whatsapp" label="WhatsApp" color="#25D366" link={WHATSAPP_URL} />
        <SocialCard icon="fa-tiktok" label="TikTok" color="#ffffff" link={TIKTOK_URL} />
        <SocialCard icon="fa-facebook-f" label="Facebook" color="#1877F2" link={FACEBOOK_URL} />
        <div className="glass p-6 rounded-[2rem] flex flex-col items-center justify-center gap-3 border border-white/5 min-h-[120px] group">
          <i className="fa-solid fa-clock-rotate-left text-[#a3cf33] text-3xl group-hover:rotate-[-45deg] transition-transform duration-500"></i>
          <span className="text-white text-[10px] font-black uppercase tracking-widest text-center">En Vivo 24/7</span>
        </div>
      </div >
    </div >
  );
};

const StreamBtn = ({ label, icon, active, color, onClick }: any) => (
  <button onClick={onClick} className={`w-full py-5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 flex flex-col items-center justify-center gap-2 ${active ? `${color} text-slate-900 shadow-[0_10px_25px_rgba(0,0,0,0.3)] scale-[1.02]` : 'bg-white/5 text-slate-500 hover:bg-white/10'}`}>
    <i className={`fa-solid ${icon} text-lg`}></i>
    {label}
  </button>
);

const SocialCard = ({ icon, label, color, link }: any) => (
  <a href={link} target="_blank" rel="noreferrer" className="glass p-6 rounded-[2rem] flex flex-col items-center justify-center gap-3 border border-white/5 hover:bg-white/5 transition-all active:scale-95 group min-h-[120px]">
    <i className={`fa-brands ${icon} text-4xl group-hover:scale-125 transition-transform duration-500`} style={{
      color,
      filter: `drop-shadow(0 0 10px ${color}44)`
    }}></i>
    <span className="text-white text-[10px] font-black uppercase tracking-widest">{label}</span>
  </a>
);

export default HomeView;
