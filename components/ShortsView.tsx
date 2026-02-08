
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
    dj2: 'DJ Asistente',
    dialogues: [
      { speaker: 'dj1', text: '¡Oeeeee mi gente bonita de La Nueva cinco cuarenta radio! ¡Miren quién está de cumpleaños hoy! Ni más ni menos que nuestra querida amiga y familia ANA MITMA QUISPE... ¡Fuego causa, qué día tan especial!' },
      { speaker: 'dj2', text: '¡Habla batería! Así es pues causa, hoy mandamos los saluditos más chéveres para Ana, que siempre nos sintoniza desde tempranito. ¡Que la pasen lindo con toda la familia, que no falte la torta y la música!' },
      { speaker: 'dj1', text: '¡Exacto mi broder! Y para ti Anita, que Dios te bendiga con mucha salud, amor y éxitos en este nuevo año de vida. ¡Que todos tus sueños se hagan realidad! De parte de toda la familia de La Nueva cinco cuarenta radio... ¡FELIZ CUMPLEAÑOS!' }
    ]
  }
];

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

// 🎉 Spot del Mercado 14 de Febrero - Día del Amor y la Amistad
const SPOT_MERCADO_14_FEBRERO = {
  id: 'spot-mercado-14-febrero',
  videoUrl: 'https://streamable.com/e/dsi3h1',
  title: '🎉 Aniversario Mercado 14 de Febrero',
  subtitle: 'Día del Amor y la Amistad - Valdiviezo',
  date: 'Sábado 14 de Febrero 2026',
  location: 'Mercado 14 de Febrero de Valdiviezo',
  dj1: 'Josecito Mitma',
  dj2: 'María Llata',
  dialogues: [
    { speaker: 'dj1', text: '¡Atención mi gente bonita! ¡Este sábado 14 de febrero celebramos en grande el Día del Amor y la Amistad! ¡Y lo hacemos en el Mercado 14 de Febrero de Valdiviezo!' },
    { speaker: 'dj2', text: '¡Así es familia! Estamos de aniversario y queremos celebrarlo contigo. Habrá música, baile y mucha alegría. ¡No te lo puedes perder!' },
    { speaker: 'dj1', text: '¡Y para que la fiesta esté de lujo, estará amenizando la potente orquesta La Nueva cinco cuarenta de Josecito Mitma y María Llata! ¡Puro sabor, pura cumbia, puro sentimiento! ¡Te esperamos!' }
  ]
};

const ShortsView: React.FC = () => {
  const [shorts, setShorts] = useState<RadioShort[]>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const wasPlayingRef = useRef(false);
  const [showBirthdays, setShowBirthdays] = useState(true);

  // Estados para Text-to-Speech
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [activeDialogue, setActiveDialogue] = useState(-1);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);

  const loadShorts = () => {
    const saved = localStorage.getItem('radio_shorts');
    setShorts(saved ? JSON.parse(saved) : MOCK_SHORTS);
  };

  // Función para obtener voz masculina o femenina en español latinoamericano
  const getLatinVoice = (preferFemale: boolean = false): SpeechSynthesisVoice | null => {
    const voices = window.speechSynthesis.getVoices();

    // Prioridad de voces latinoamericanas (más cercanas al acento peruano)
    const latinLocales = ['es-MX', 'es-PE', 'es-CO', 'es-AR', 'es-CL', 'es-419', 'es-US', 'es-ES'];

    // Nombres comunes de voces femeninas
    const femaleNames = ['female', 'paulina', 'maria', 'mónica', 'monica', 'elena', 'laura', 'carmen', 'rosa', 'lucia', 'francisca', 'angelica', 'sabina', 'helena', 'penelope'];
    // Nombres comunes de voces masculinas
    const maleNames = ['male', 'jorge', 'juan', 'carlos', 'diego', 'pablo', 'miguel', 'andres', 'antonio', 'pedro', 'enrique', 'rodriguez'];

    // Buscar voz del género correcto en idioma latinoamericano
    for (const locale of latinLocales) {
      const matchingVoices = voices.filter(v => v.lang === locale);

      for (const voice of matchingVoices) {
        const nameLower = voice.name.toLowerCase();
        if (preferFemale) {
          // Buscar voz femenina
          if (femaleNames.some(fn => nameLower.includes(fn))) return voice;
        } else {
          // Buscar voz masculina
          if (maleNames.some(mn => nameLower.includes(mn))) return voice;
        }
      }
    }

    // Si no encontró del género específico, buscar cualquier español del género opuesto
    const allSpanish = voices.filter(v => v.lang.startsWith('es'));
    for (const voice of allSpanish) {
      const nameLower = voice.name.toLowerCase();
      if (preferFemale && femaleNames.some(fn => nameLower.includes(fn))) return voice;
      if (!preferFemale && maleNames.some(mn => nameLower.includes(mn))) return voice;
    }

    // Fallback: devolver cualquier voz en español
    return allSpanish.length > 0 ? allSpanish[preferFemale ? 1 : 0] || allSpanish[0] : null;
  };

  // Función para leer los diálogos con voces estilo locutor peruano
  const speakDialogues = (dialogues: { speaker: string; text: string }[]) => {
    if ('speechSynthesis' in window) {
      // Cancelar cualquier lectura anterior
      window.speechSynthesis.cancel();

      // Esperar a que las voces estén disponibles
      const startSpeaking = () => {
        let currentIndex = 0;

        const speakNext = () => {
          if (currentIndex < dialogues.length) {
            setActiveDialogue(currentIndex);
            const dialogue = dialogues[currentIndex];
            // Agregar mucho texto de "sacrificio" al inicio para absorber el corte del TTS
            // El TTS en móvil corta hasta 20 caracteres al inicio
            const textWithPause = 'mmm, mmm, mmm, ' + dialogue.text;
            const utterance = new SpeechSynthesisUtterance(textWithPause);

            // Obtener voz latinoamericana
            const voice = getLatinVoice(dialogue.speaker === 'dj2');
            if (voice) {
              utterance.voice = voice;
              utterance.lang = voice.lang;
            } else {
              utterance.lang = 'es-MX'; // Fallback a español mexicano
            }

            // Configuración estilo locutor de radio peruano CON EMOCIÓN
            if (dialogue.speaker === 'dj1') {
              // DJ Principal: voz POTENTE y ENÉRGICA
              utterance.rate = 1.45; // ¡Más rápido y eufórico!
              utterance.pitch = 1.1; // Más expresivo
              utterance.volume = 1.0;
            } else {
              // DJ Asistente: voz MUY alegre y animada
              utterance.rate = 1.50; // ¡Super animada!
              utterance.pitch = 1.35; // Voz más aguda y festiva
              utterance.volume = 1.0;
            }

            utterance.onend = () => {
              currentIndex++;
              if (currentIndex < dialogues.length) {
                setTimeout(speakNext, 400); // Pausa corta ¡más dinámico!
              } else {
                setIsSpeaking(false);
                setActiveDialogue(-1);
              }
            };

            speechRef.current = utterance;
            window.speechSynthesis.speak(utterance);
          }
        };

        setIsSpeaking(true);

        // NUEVO ENFOQUE: Warmup que TERMINA completamente antes del texto real
        const warmup = new SpeechSynthesisUtterance('Hola');
        warmup.volume = 0.01; // Casi silencioso pero no cero
        warmup.rate = 3; // Muy rápido

        // Esperar a que el warmup TERMINE antes de hablar el texto real
        warmup.onend = () => {
          // El motor ya está 100% caliente, ahora sí hablar
          // Delay largo para asegurar que esté listo
          setTimeout(speakNext, 500);
        };

        warmup.onerror = () => {
          // Si hay error, intentar de todos modos
          setTimeout(speakNext, 500);
        };

        window.speechSynthesis.speak(warmup);
      };

      // Las voces pueden no estar disponibles inmediatamente
      if (window.speechSynthesis.getVoices().length > 0) {
        startSpeaking();
      } else {
        window.speechSynthesis.onvoiceschanged = startSpeaking;
      }
    }
  };

  const stopSpeaking = () => {
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
    setActiveDialogue(-1);
  };

  const toggleSpeech = (dialogues: { speaker: string; text: string }[]) => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      speakDialogues(dialogues);
    }
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
                {/* Botón para escuchar */}
                <button
                  onClick={() => toggleSpeech(birthday.dialogues)}
                  className={`w-full flex items-center justify-center gap-3 py-3 px-6 rounded-full font-black text-sm uppercase tracking-wider transition-all duration-300 ${isSpeaking
                    ? 'bg-red-500 text-white animate-pulse hover:bg-red-600'
                    : 'bg-gradient-to-r from-[#a3cf33] to-yellow-400 text-black hover:scale-105'
                    }`}
                >
                  <i className={`fa-solid ${isSpeaking ? 'fa-stop' : 'fa-volume-high'} text-lg`}></i>
                  {isSpeaking ? '⏹️ Detener' : '🎙️ Escuchar Saludo'}
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
              {/* Botón para escuchar */}
              <button
                onClick={() => toggleSpeech(PROMO_SALUDITOS.dialogues)}
                className={`w-full flex items-center justify-center gap-3 py-3 px-6 rounded-full font-black text-sm uppercase tracking-wider transition-all duration-300 ${isSpeaking
                  ? 'bg-red-500 text-white animate-pulse hover:bg-red-600'
                  : 'bg-gradient-to-r from-cyan-500 to-[#a3cf33] text-black hover:scale-105'
                  }`}
              >
                <i className={`fa-solid ${isSpeaking ? 'fa-stop' : 'fa-volume-high'} text-lg`}></i>
                {isSpeaking ? '⏹️ Detener' : '🎙️ Escuchar Invitación'}
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

      {/* 💕 SPOT MERCADO 14 DE FEBRERO - DÍA DEL AMOR Y LA AMISTAD */}
      <div
        key={SPOT_MERCADO_14_FEBRERO.id}
        className="relative w-full h-full snap-start flex flex-col bg-gradient-to-br from-slate-950 via-rose-950/40 to-red-950/30 overflow-hidden"
      >
        {/* Fondo decorativo con corazones */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(25)].map((_, i) => (
            <div
              key={i}
              className="absolute animate-pulse text-2xl"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDuration: `${2 + Math.random() * 3}s`,
                animationDelay: `${Math.random() * 2}s`,
                opacity: 0.4
              }}
            >
              {['💕', '❤️', '💖', '🎵', '🎉'][i % 5]}
            </div>
          ))}
          <div className="absolute top-0 left-0 w-96 h-96 bg-rose-500/20 rounded-full blur-[120px] animate-pulse"></div>
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-red-500/20 rounded-full blur-[100px] animate-pulse"></div>
        </div>

        {/* Contenido principal */}
        <div className="relative z-10 flex flex-col lg:flex-row items-center justify-start lg:justify-center h-full gap-4 lg:gap-8 p-4 lg:p-12 overflow-y-auto">

          {/* Video de Streamable */}
          <div className="relative flex-shrink-0 w-full max-w-[280px] lg:max-w-sm">
            <div className="absolute -inset-2 lg:-inset-4 bg-gradient-to-r from-rose-500 via-red-500 to-pink-500 rounded-2xl lg:rounded-3xl blur-lg lg:blur-xl opacity-50 animate-pulse"></div>
            <div className="relative rounded-xl lg:rounded-2xl overflow-hidden shadow-2xl border-2 border-white/20 aspect-[9/16]">
              <iframe
                src={SPOT_MERCADO_14_FEBRERO.videoUrl}
                className="absolute inset-0 w-full h-full"
                frameBorder="0"
                allow="autoplay; fullscreen"
                allowFullScreen
              ></iframe>
            </div>
          </div>

          {/* Texto de información del evento */}
          <div className="text-center lg:text-left space-y-6 max-w-lg">
            <div className="space-y-3">
              <span className="bg-gradient-to-r from-rose-500 to-red-500 text-white px-5 py-2 rounded-full text-[10px] font-black uppercase tracking-[0.3em] shadow-xl inline-block animate-pulse">
                💕 {SPOT_MERCADO_14_FEBRERO.date}
              </span>
              <h2 className="text-3xl lg:text-4xl font-black text-white uppercase tracking-tight leading-tight">
                {SPOT_MERCADO_14_FEBRERO.title}
              </h2>
              <p className="text-rose-300 text-sm font-bold">{SPOT_MERCADO_14_FEBRERO.subtitle}</p>

              {/* Ubicación */}
              <div className="flex items-center justify-center lg:justify-start gap-2 text-rose-200 text-xs">
                <i className="fa-solid fa-location-dot text-rose-400"></i>
                <span>{SPOT_MERCADO_14_FEBRERO.location}</span>
              </div>
            </div>

            {/* Diálogos con voz */}
            <div className="space-y-4 bg-black/40 backdrop-blur-sm rounded-3xl p-5 border border-white/10">
              {/* Botón para escuchar */}
              <button
                onClick={() => toggleSpeech(SPOT_MERCADO_14_FEBRERO.dialogues)}
                className={`w-full flex items-center justify-center gap-3 py-3 px-6 rounded-full font-black text-sm uppercase tracking-wider transition-all duration-300 ${isSpeaking
                  ? 'bg-red-500 text-white animate-pulse hover:bg-red-600'
                  : 'bg-gradient-to-r from-rose-500 to-red-500 text-white hover:scale-105'
                  }`}
              >
                <i className={`fa-solid ${isSpeaking ? 'fa-stop' : 'fa-volume-high'} text-lg`}></i>
                {isSpeaking ? '⏹️ Detener' : '🎙️ Escuchar Anuncio'}
              </button>

              {SPOT_MERCADO_14_FEBRERO.dialogues.map((dialogue, idx) => (
                <div key={idx} className={`flex items-start gap-3 p-3 rounded-2xl transition-all duration-500 ${activeDialogue === idx ? (dialogue.speaker === 'dj1' ? 'bg-rose-500/20 ring-2 ring-rose-500' : 'bg-pink-500/20 ring-2 ring-pink-500') + ' scale-[1.02]' : ''}`}>
                  <div className={`w-10 h-10 ${dialogue.speaker === 'dj1' ? 'bg-rose-500' : 'bg-pink-500'} rounded-full flex items-center justify-center flex-shrink-0 ${activeDialogue === idx ? 'animate-pulse' : ''}`}>
                    <i className={`fa-solid ${dialogue.speaker === 'dj1' ? 'fa-microphone' : 'fa-headphones'} text-white text-sm`}></i>
                  </div>
                  <div className="flex-1">
                    <p className={`${dialogue.speaker === 'dj1' ? 'text-rose-400' : 'text-pink-400'} text-[10px] font-black uppercase tracking-wider mb-1`}>
                      {dialogue.speaker === 'dj1' ? SPOT_MERCADO_14_FEBRERO.dj1 : SPOT_MERCADO_14_FEBRERO.dj2}
                    </p>
                    <p className="text-white text-sm leading-relaxed">{dialogue.text}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Call to action */}
            <div className="flex items-center justify-center lg:justify-start gap-2 text-slate-400 text-[9px] font-bold uppercase tracking-widest">
              <span className="animate-bounce">💖</span>
              <span>Orquesta La Nueva 5:40 - ¡Te esperamos!</span>
              <span className="animate-bounce">🎵</span>
            </div>
          </div>
        </div>

        {/* Badge */}
        <div className="absolute top-6 left-6 z-20">
          <span className="bg-gradient-to-r from-rose-500 to-red-500 text-white px-4 py-1.5 rounded-full text-[8px] font-black uppercase tracking-[0.2em] shadow-2xl inline-flex items-center gap-2">
            <i className="fa-solid fa-heart"></i>
            Evento Especial
          </span>
        </div>

        {/* Indicador de scroll */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 animate-bounce">
          <span className="text-slate-500 text-[8px] font-bold uppercase tracking-widest">Desliza para más</span>
          <i className="fa-solid fa-chevron-down text-rose-400"></i>
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
