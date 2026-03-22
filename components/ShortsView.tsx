
import React, { useState, useEffect, useRef } from 'react';
import { RadioShort } from '../types';
import { MOCK_SHORTS, LA_MACHI_DIALOGUES, ORQUESTA_DIALOGUES, ENTRUST_DIALOGUES, TODO_GORRAS_DIALOGUES } from '../constants';
import { generateGeminiSpeech, decodeGeminiAudio, playGeminiAudio } from '../services/geminiTTSService';

// Datos de cumpleañeros
const BIRTHDAY_GREETINGS: any[] = [];

// Promoción para enviar saluditos
const PROMO_SALUDITOS = {
  id: 'promo-saluditos',
  videoUrl: 'https://streamable.com/e/z7wviw',
  title: '¡Envía tus Saluditos!',
  subtitle: 'Cumpleaños, Aniversarios, Dedicatorias y más',
  dj1: 'DJ Principal',
  dj2: 'DJ Asistente',
  dialogues: [
    { speaker: 'dj1', text: '¡Atención mi gente linda de La Nueva cinco cuarenta radio! ¿Quieres mandar un saludito especial a alguien? ¿Un cumpleaños, un aniversario, una dedicatoria romántica? ¡Pues llegó tu momento!' },
    { speaker: 'dj2', text: '¡Así es causa! Ahora puedes enviar tus saluditos directamente desde nuestra app. Es súper fácil, solo escríbenos y nosotros lo leemos al aire para que toda la familia cinco cuarenta radio lo escuche.' },
    { speaker: 'dj1', text: '¡No te quedes sin participar! Manda tu saludito ahora mismo y sorprende a esa persona especial. ¡La Nueva cinco cuarenta radio, tu radio de siempre, conectando corazones!' }
  ]
};


const ShortsView: React.FC = () => {
  const [shorts, setShorts] = useState<RadioShort[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const wasPlayingRef = useRef(false);
  const [showBirthdays, setShowBirthdays] = useState(true);

  // Estados para Gemini AI Voice (más profesional)
  const [isGeminiSpeaking, setIsGeminiSpeaking] = useState(false);
  const [isGeminiThinking, setIsGeminiThinking] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const [activeDialogue, setActiveDialogue] = useState(-1);

  const loadShorts = () => {
    const saved = localStorage.getItem('radio_shorts');
    setShorts(saved ? JSON.parse(saved) : MOCK_SHORTS);
  };



  // Nueva función: Generar y reproducir anuncios con voz AI de Gemini
  const speakWithGemini = async (dialogues: { speaker: string; text: string }[]) => {
    if (isGeminiSpeaking) {
      stopGeminiSpeaking();
      return;
    }

    if (!audioCtxRef.current || audioCtxRef.current.state === 'closed') {
      audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
    }

    // Resume context if suspended (crucial for mobile)
    if (audioCtxRef.current.state === 'suspended') {
      try {
        await audioCtxRef.current.resume();
      } catch (e) {
        console.error("Error resuming audio context:", e);
      }
    }

    setIsGeminiThinking(true);

    // Combinar todos los diálogos en un solo texto
    const combinedText = dialogues.map(d => d.text).join(' ... ');

    try {
      const base64Audio = await generateGeminiSpeech(combinedText, 'Kore');

      if (base64Audio && audioCtxRef.current) {
        setIsGeminiThinking(false);
        setIsGeminiSpeaking(true);

        const audioBuffer = await decodeGeminiAudio(base64Audio, audioCtxRef.current);
        if (audioBuffer) {
          // Simular progreso de diálogos basado en duración del audio
          const totalDuration = audioBuffer.duration * 1000; // en ms
          const durationPerDialogue = totalDuration / dialogues.length;

          let currentDialogue = 0;
          const progressInterval = setInterval(() => {
            if (currentDialogue < dialogues.length) {
              setActiveDialogue(currentDialogue);
              currentDialogue++;
            } else {
              clearInterval(progressInterval);
            }
          }, durationPerDialogue);

          const source = playGeminiAudio(
            audioBuffer,
            audioCtxRef.current,
            () => setActiveDialogue(0),
            () => {
              clearInterval(progressInterval);
              setIsGeminiSpeaking(false);
              setActiveDialogue(-1);
            }
          );
          audioSourceRef.current = source;
        } else {
          setIsGeminiThinking(false);
          setIsGeminiSpeaking(false);
        }
      } else {
        // Sin API key o error
        setIsGeminiThinking(false);
        alert('⚠️ Necesitas configurar la API key de Gemini para usar la voz AI.');
      }
    } catch (error) {
      console.error('Error generando voz:', error);
      setIsGeminiThinking(false);
      setIsGeminiSpeaking(false);
    }
  };

  const stopGeminiSpeaking = () => {
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current = null;
    }
    setIsGeminiSpeaking(false);
    setIsGeminiThinking(false);
    setActiveDialogue(-1);
    window.dispatchEvent(new CustomEvent('radio_volume_change', { detail: { level: 0.8 } }));
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
      window.speechSynthesis.cancel(); // Detener voz al salir
      stopGeminiSpeaking(); // Detener Gemini AI voice
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
    return `https://www.youtube.com/embed/${videoId}?autoplay=${isActive ? 1 : 0}&controls=0&modestbranding=1&rel=0&mute=0&loop=1&playlist=${videoId}&showinfo=0&iv_load_policy=3`;
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

          {/* Contenido principal - scrollable en móvil */}
          <div className="relative z-10 flex flex-col lg:flex-row items-center justify-start lg:justify-center h-full gap-4 lg:gap-8 p-4 lg:p-12 overflow-y-auto pt-16">

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
                {/* Botón de voz AI */}
                <button
                  onClick={() => speakWithGemini(birthday.dialogues)}
                  className={`w-full flex items-center justify-center gap-3 py-3 px-6 rounded-full font-black text-sm uppercase tracking-wider transition-all duration-300 ${isGeminiSpeaking || isGeminiThinking
                    ? 'bg-red-500 text-white animate-pulse hover:bg-red-600'
                    : 'bg-gradient-to-r from-[#a3cf33] to-yellow-400 text-black hover:scale-105'
                    }`}
                >
                  {isGeminiThinking ? (
                    <>
                      <i className="fa-solid fa-spinner fa-spin text-lg"></i>
                      Generando...
                    </>
                  ) : isGeminiSpeaking ? (
                    <>
                      <i className="fa-solid fa-stop text-lg"></i>
                      ⏹️ Detener
                    </>
                  ) : (
                    <>
                      <i className="fa-solid fa-microphone-lines text-lg"></i>
                      🎙️ Escuchar Saludo
                    </>
                  )}
                </button>

                <div className={`flex items-start gap-3 p-3 rounded-2xl transition-all duration-500 ${activeDialogue === 0 ? 'bg-[#a3cf33]/20 ring-2 ring-[#a3cf33] scale-[1.02]' : ''}`}>
                  <div className={`w-10 h-10 bg-[#a3cf33] rounded-full flex items-center justify-center flex-shrink-0 ${activeDialogue === 0 ? 'animate-pulse' : ''}`}>
                    <i className="fa-solid fa-microphone text-black text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-[#a3cf33] text-[10px] font-black uppercase tracking-wider mb-1">{birthday.dj1}</p>
                    <p className="text-white text-sm leading-relaxed">
                      ¡Oeeeee mi gente bonita de La Nueva 5:40! 🎤 ¡Miren quién está de cumpleaños hoy! Ni más ni menos que nuestra querida amiga y familia <span className="text-pink-400 font-black">ANA MITMA QUISPE</span>... ¡Fuego causa, qué día tan especial! 🔥
                    </p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 p-3 rounded-2xl transition-all duration-500 ${activeDialogue === 1 ? 'bg-pink-500/20 ring-2 ring-pink-500 scale-[1.02]' : ''}`}>
                  <div className={`w-10 h-10 bg-pink-500 rounded-full flex items-center justify-center flex-shrink-0 ${activeDialogue === 1 ? 'animate-pulse' : ''}`}>
                    <i className="fa-solid fa-headphones text-white text-sm"></i>
                  </div>
                  <div className="flex-1">
                    <p className="text-pink-400 text-[10px] font-black uppercase tracking-wider mb-1">{birthday.dj2}</p>
                    <p className="text-white text-sm leading-relaxed">
                      ¡Habla batería! 🎧 Así es pues causa, hoy mandamos los saluditos más chéveres para Ana, que siempre nos sintoniza desde tempranito. ¡Que la pasen lindo con toda la familia, que no falte la torta y la música! 🎂🎶
                    </p>
                  </div>
                </div>

                <div className={`flex items-start gap-3 p-3 rounded-2xl transition-all duration-500 ${activeDialogue === 2 ? 'bg-[#a3cf33]/20 ring-2 ring-[#a3cf33] scale-[1.02]' : ''}`}>
                  <div className={`w-10 h-10 bg-[#a3cf33] rounded-full flex items-center justify-center flex-shrink-0 ${activeDialogue === 2 ? 'animate-pulse' : ''}`}>
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

      {/* 📢 PROMOCIÓN DE SALUDITOS */}
      <div
        key={PROMO_SALUDITOS.id}
        className="relative w-full h-full snap-start flex flex-col bg-gradient-to-br from-slate-950 via-blue-950/40 to-cyan-950/30 overflow-hidden"
      >
        {/* Fondo decorativo */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(20)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-ping"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#00E5FF', '#a3cf33', '#FF69B4', '#FFD700'][i % 4],
                animationDuration: `${2 + Math.random() * 3}s`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: 0.5
              }}
            />
          ))}
          <div className="absolute top-0 left-0 w-96 h-96 bg-cyan-500/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#a3cf33]/20 rounded-full blur-[100px] animate-pulse"></div>
        </div>

        {/* Contenido principal - scrollable en móvil */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-start lg:justify-center h-full gap-4 lg:gap-8 p-4 lg:p-12 overflow-y-auto">

          {/* Video de Streamable - vertical en móvil */}
          <div className="relative flex-shrink-0 w-full max-w-[280px] lg:max-w-sm">
            <div className="absolute -inset-2 lg:-inset-4 bg-gradient-to-r from-cyan-500 via-[#a3cf33] to-blue-500 rounded-2xl lg:rounded-3xl blur-lg lg:blur-xl opacity-50 animate-pulse"></div>
            <div className="relative rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 aspect-[9/16]">
              <iframe
                src={PROMO_SALUDITOS.videoUrl}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* Texto de invitación */}
          <div className="text-center lg:text-left space-y-6 max-w-lg">
            <div className="space-y-3">
              <span className="bg-gradient-to-r from-cyan-500 to-[#a3cf33] text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-xl inline-block animate-pulse">
                📢 ¡Participa Ahora!
              </span>
              <h2 className="text-3xl lg:text-4xl font-black text-white uppercase tracking-tight leading-tight">
                {PROMO_SALUDITOS.title}
              </h2>
              <p className="text-cyan-300 text-sm font-bold">{PROMO_SALUDITOS.subtitle}</p>
            </div>

            {/* Diálogos con voz */}
            <div className="space-y-4 bg-black/40 backdrop-blur-sm rounded-3xl p-5 border border-white/10">
              {/* Botón de voz AI */}
              <button
                onClick={() => speakWithGemini(PROMO_SALUDITOS.dialogues)}
                className={`w-full flex items-center justify-center gap-3 py-3 px-6 rounded-full font-black text-sm uppercase tracking-wider transition-all duration-300 ${isGeminiSpeaking || isGeminiThinking
                  ? 'bg-red-500 text-white animate-pulse hover:bg-red-600'
                  : 'bg-gradient-to-r from-cyan-500 to-[#a3cf33] text-black hover:scale-105'
                  }`}
              >
                {isGeminiThinking ? (
                  <>
                    <i className="fa-solid fa-spinner fa-spin text-lg"></i>
                    Generando...
                  </>
                ) : isGeminiSpeaking ? (
                  <>
                    <i className="fa-solid fa-stop text-lg"></i>
                    ⏹️ Detener
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-microphone-lines text-lg"></i>
                    🎙️ Escuchar Invitación
                  </>
                )}
              </button>

              {PROMO_SALUDITOS.dialogues.map((dialogue, idx) => (
                <div key={idx} className={`flex items-start gap-3 p-3 rounded-2xl transition-all duration-500 ${activeDialogue === idx ? (dialogue.speaker === 'dj1' ? 'bg-[#a3cf33]/20 ring-2 ring-[#a3cf33]' : 'bg-cyan-500/20 ring-2 ring-cyan-500') + ' scale-[1.02]' : ''}`}>
                  <div className={`w-10 h-10 ${dialogue.speaker === 'dj1' ? 'bg-[#a3cf33]' : 'bg-cyan-500'} rounded-full flex items-center justify-center flex-shrink-0 ${activeDialogue === idx ? 'animate-pulse' : ''}`}>
                    <i className={`fa-solid ${dialogue.speaker === 'dj1' ? 'fa-microphone text-black' : 'fa-headphones text-white'} text-sm`}></i>
                  </div>
                  <div className="flex-1">
                    <p className={`${dialogue.speaker === 'dj1' ? 'text-[#a3cf33]' : 'text-cyan-400'} text-[10px] font-black uppercase tracking-wider mb-1`}>
                      {dialogue.speaker === 'dj1' ? PROMO_SALUDITOS.dj1 : PROMO_SALUDITOS.dj2}
                    </p>
                    <p className="text-white text-sm leading-relaxed">{dialogue.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Call to action */}
            <div className="flex items-center justify-center lg:justify-start gap-2 text-slate-400 text-[9px] font-bold uppercase tracking-widest">
              <span className="animate-bounce">📱</span>
              <span>Usa nuestra app y manda tu saludito</span>
              <span className="animate-bounce">💬</span>
            </div>
          </div>
        </div>

        {/* Badge */}
        <div className="absolute top-6 left-6 z-20">
          <span className="bg-gradient-to-r from-cyan-500 to-[#a3cf33] text-black px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-2xl inline-flex items-center gap-2">
            <i className="fa-solid fa-bullhorn"></i>
            Promo 5:40
          </span>
        </div>

        {/* Indicador de scroll */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-slate-500 text-[8px] font-bold uppercase tracking-widest">Desliza para más</span>
          <i className="fa-solid fa-chevron-down text-cyan-400"></i>
        </div>
      </div>



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
            <div className="absolute inset-0 flex items-center justify-center bg-[#000]">
              {short.videoUrl ? (
                <div className="w-full h-full max-w-4xl aspect-video lg:aspect-auto">
                  <iframe
                    src={getEmbedUrl(short.videoUrl, index)}
                    className="w-full h-full"
                    frameBorder="0"
                    allow="autoplay; encrypted-media"
                  ></iframe>
                </div>
              ) : (
                <img
                  src={short.thumbnail}
                  alt={short.title}
                  className="max-w-full max-h-full object-contain shadow-2xl"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80 pointer-events-none"></div>
            </div>

            <div className="absolute bottom-12 lg:bottom-4 left-1/2 -translate-x-1/2 w-full max-w-2xl px-6 z-20 space-y-2 pointer-events-none flex flex-col items-center text-center">
              <div className="flex flex-wrap items-center justify-center gap-2 md:gap-3">
                <span className="bg-[#a3cf33] text-black px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-[0.2em] shadow-2xl inline-block">Publicidad 5:40</span>
                <span className="bg-blue-600 text-white px-3 py-1 rounded-full text-[7px] font-black uppercase tracking-[0.2em] shadow-2xl inline-block">🐟 Auspiciador Oficial</span>
              </div>

              <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tighter drop-shadow-2xl mb-1">{short.title}</h3>

              {short.id === 'ad-la-machi' && (
                <div className="pointer-events-auto w-[90%] md:w-auto flex flex-col items-center mx-auto">
                  <button
                    onClick={() => speakWithGemini(LA_MACHI_DIALOGUES)}
                    className={`flex items-center justify-center gap-3 py-3 px-10 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-2xl ${isGeminiSpeaking || isGeminiThinking
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-gradient-to-r from-[#a3cf33] to-yellow-400 text-black hover:scale-105 active:scale-95'
                      }`}
                  >
                    {isGeminiThinking ? (
                      <><i className="fa-solid fa-spinner fa-spin text-lg"></i> Sintonizando...</>
                    ) : isGeminiSpeaking ? (
                      <><i className="fa-solid fa-stop text-lg"></i> Detener Spot</>
                    ) : (
                      <><i className="fa-solid fa-microphone-lines text-lg"></i> Escuchar Spot 🎙️</>
                    )}
                  </button>

                  {isGeminiSpeaking && activeDialogue !== -1 && (
                    <div className="mt-4 bg-black/80 backdrop-blur-[20px] p-5 rounded-[2rem] border border-white/20 animate-fadeInUp max-w-md shadow-2xl">
                      <p className="text-[#a3cf33] text-[10px] font-black uppercase mb-1 tracking-widest text-center">
                        {LA_MACHI_DIALOGUES[activeDialogue].speaker === 'dj1' ? 'DJ Principal' : 'DJ Asistente'}
                      </p>
                      <p className="text-white text-xs md:text-sm leading-relaxed italic font-medium">
                        "{LA_MACHI_DIALOGUES[activeDialogue].text}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {short.id === 'ad-orquesta' && (
                <div className="pointer-events-auto w-[90%] md:w-auto flex flex-col items-center mx-auto">
                  <button
                    onClick={() => speakWithGemini(ORQUESTA_DIALOGUES)}
                    className={`flex items-center justify-center gap-3 py-3 px-10 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-2xl ${isGeminiSpeaking || isGeminiThinking
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-gradient-to-r from-orange-500 to-yellow-400 text-black hover:scale-105 active:scale-95'
                      }`}
                  >
                    {isGeminiThinking ? (
                      <><i className="fa-solid fa-spinner fa-spin text-lg"></i> Sintonizando...</>
                    ) : isGeminiSpeaking ? (
                      <><i className="fa-solid fa-stop text-lg"></i> Detener Spot</>
                    ) : (
                      <><i className="fa-solid fa-microphone-lines text-lg"></i> Escuchar Fiesta 🎺</>
                    )}
                  </button>

                  {isGeminiSpeaking && activeDialogue !== -1 && (
                    <div className="mt-4 bg-black/80 backdrop-blur-[20px] p-5 rounded-[2rem] border border-white/20 animate-fadeInUp max-w-md shadow-2xl">
                      <p className="text-orange-400 text-[10px] font-black uppercase mb-1 tracking-widest text-center">
                        {ORQUESTA_DIALOGUES[activeDialogue].speaker === 'dj1' ? 'DJ Principal' : 'DJ Asistente'}
                      </p>
                      <p className="text-white text-xs md:text-sm leading-relaxed italic font-medium">
                        "{ORQUESTA_DIALOGUES[activeDialogue].text}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {short.id === 'ad-todo-gorras' && (
                <div className="pointer-events-auto w-[90%] md:w-auto flex flex-col items-center mx-auto">
                  <button
                    onClick={() => speakWithGemini(TODO_GORRAS_DIALOGUES)}
                    className={`flex items-center justify-center gap-3 py-3 px-10 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-2xl ${isGeminiSpeaking || isGeminiThinking
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-gradient-to-r from-red-600 to-red-400 text-white hover:scale-105 active:scale-95'
                      }`}
                  >
                    {isGeminiThinking ? (
                      <><i className="fa-solid fa-spinner fa-spin text-lg"></i> Sintonizando...</>
                    ) : isGeminiSpeaking ? (
                      <><i className="fa-solid fa-stop text-lg"></i> Detener Spot</>
                    ) : (
                      <><i className="fa-solid fa-industry text-lg"></i> Escuchar Spot 🧢</>
                    )}
                  </button>

                  {isGeminiSpeaking && activeDialogue !== -1 && (
                    <div className="mt-4 bg-black/80 backdrop-blur-[20px] p-5 rounded-[2rem] border border-white/20 animate-fadeInUp max-w-md shadow-2xl">
                      <p className="text-red-400 text-[10px] font-black uppercase mb-1 tracking-widest text-center">
                        {TODO_GORRAS_DIALOGUES[activeDialogue].speaker === 'dj1' ? 'DJ Principal' : 'DJ Asistente'}
                      </p>
                      <p className="text-white text-xs md:text-sm leading-relaxed italic font-medium">
                        "{TODO_GORRAS_DIALOGUES[activeDialogue].text}"
                      </p>
                    </div>
                  )}
                </div>
              )}

              {short.id === 'ad-entrust' && (
                <div className="pointer-events-auto w-[90%] md:w-auto flex flex-col items-center mx-auto">
                  <button
                    onClick={() => speakWithGemini(ENTRUST_DIALOGUES)}
                    className={`flex items-center justify-center gap-3 py-3 px-10 rounded-2xl font-black text-xs uppercase tracking-wider transition-all duration-300 shadow-2xl ${isGeminiSpeaking || isGeminiThinking
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'bg-gradient-to-r from-blue-500 to-cyan-400 text-white hover:scale-105 active:scale-95'
                      }`}
                  >
                    {isGeminiThinking ? (
                      <><i className="fa-solid fa-spinner fa-spin text-lg"></i> Sintonizando...</>
                    ) : isGeminiSpeaking ? (
                      <><i className="fa-solid fa-stop text-lg"></i> Detener Spot</>
                    ) : (
                      <><i className="fa-solid fa-hat-cowboy text-lg"></i> Escuchar Estilo 🧢</>
                    )}
                  </button>

                  {isGeminiSpeaking && activeDialogue !== -1 && (
                    <div className="mt-4 bg-black/80 backdrop-blur-[20px] p-5 rounded-[2rem] border border-white/20 animate-fadeInUp max-w-md shadow-2xl">
                      <p className="text-blue-400 text-[10px] font-black uppercase mb-1 tracking-widest text-center">
                        {ENTRUST_DIALOGUES[activeDialogue].speaker === 'dj1' ? 'DJ Principal' : 'DJ Asistente'}
                      </p>
                      <p className="text-white text-xs md:text-sm leading-relaxed italic font-medium">
                        "{ENTRUST_DIALOGUES[activeDialogue].text}"
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

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
