
import React, { useState, useEffect } from 'react';
import { WHATSAPP_URL, TIKTOK_URL, FACEBOOK_URL, RADIO_STREAM_URL, RADIO_STREAM_CUMBIAS, RADIO_STREAM_HUAYNOS } from '../constants';

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

  const triggerDjTest = () => {
    window.dispatchEvent(new CustomEvent('trigger_jingle_manual'));
  };

  const pedirCancion = () => {
    const msg = encodeURIComponent("¡Habla La Nueva 5:40! Quiero pedir un temita para el barrio...");
    window.open(`${WHATSAPP_URL}?text=${msg}`, '_blank');
  };

  return (
    <div className="space-y-6 md:space-y-10 animate-fadeIn">
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
              <p className="text-[#a3cf33] font-mono text-2xl md:text-3xl lg:text-4xl font-bold tracking-wider">
                {peruTime || '--:--:--'}
              </p>
              <p className="text-slate-400 text-[8px] md:text-[9px] font-bold uppercase tracking-widest mt-1">
                {peruDate || 'Cargando...'} • Hora Perú
              </p>
            </div>
          </div>
          <div className="flex flex-wrap justify-center items-center gap-3 w-full lg:w-auto">
            <button
              onClick={pedirCancion}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-[#25D366] text-white shadow-xl shadow-[#25D366]/20 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:scale-105 transition-all active:scale-95 group"
            >
              <i className="fa-brands fa-whatsapp text-xl group-hover:animate-bounce"></i>
              WhatsApp
            </button>
            <button
              onClick={triggerDjTest}
              className="flex-1 lg:flex-none flex items-center justify-center gap-2 px-6 py-4 bg-orange-600 text-white shadow-xl shadow-orange-600/20 rounded-2xl text-[9px] font-black uppercase tracking-widest hover:bg-orange-500 hover:scale-105 transition-all active:scale-95 group"
            >
              <i className="fa-solid fa-microphone-lines text-xl group-hover:scale-110 transition-transform"></i>
              DJ AI
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <p className="text-[8px] font-black text-slate-600 uppercase tracking-[0.5em] text-center lg:text-left mb-2">Señales Disponibles</p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <StreamBtn label="Principal" icon="fa-tower-broadcast" active={activeStream === RADIO_STREAM_URL} color="bg-[#a3cf33]" onClick={() => switchStream(RADIO_STREAM_URL)} />
            <StreamBtn label="Cumbias" icon="fa-guitar" active={activeStream === RADIO_STREAM_CUMBIAS} color="bg-[#3fb4e5]" onClick={() => switchStream(RADIO_STREAM_CUMBIAS)} />
            <StreamBtn label="Huaynos" icon="fa-music" active={activeStream === RADIO_STREAM_HUAYNOS} color="bg-orange-500" onClick={() => switchStream(RADIO_STREAM_HUAYNOS)} />
          </div>
        </div>
      </section>

      {/* HERO PLAYER */}
      <section className="bg-gradient-to-br from-[#0a0f1a] to-black rounded-[2.5rem] md:rounded-[4rem] p-8 md:p-14 border border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 md:gap-12 shadow-2xl overflow-hidden relative group">
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
      </section>

      {/* SOCIAL GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <SocialCard icon="fa-whatsapp" label="WhatsApp" color="#25D366" link={WHATSAPP_URL} />
        <SocialCard icon="fa-tiktok" label="TikTok" color="#ffffff" link={TIKTOK_URL} />
        <SocialCard icon="fa-facebook-f" label="Facebook" color="#1877F2" link={FACEBOOK_URL} />
        <div className="glass p-6 rounded-[2rem] flex flex-col items-center justify-center gap-3 border border-white/5 min-h-[120px] group">
          <i className="fa-solid fa-clock-rotate-left text-[#a3cf33] text-3xl group-hover:rotate-[-45deg] transition-transform duration-500"></i>
          <span className="text-white text-[10px] font-black uppercase tracking-widest text-center">En Vivo 24/7</span>
        </div>
      </div>
    </div>
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
