
import { RadioEvent, YouTubeVideo, RadioShort, MusicTrack, RadioPoll } from './types';

export const RADIO_STREAM_URL = 'https://stream-165.zeno.fm/2bn9rmgylhpvv?zt';
export const RADIO_STREAM_ROCK = 'https://stream-143.zeno.fm/0vgy8qv3feruv?zt';
export const RADIO_STREAM_CUMBIAS = 'https://stream-145.zeno.fm/ut46b6drneruv?zt';
export const RADIO_STREAM_HUAYNOS = 'https://stream-165.zeno.fm/eiev8ylwugruv?zt';
export const RADIO_STREAM_SALSA = 'https://stream-142.zeno.fm/9k0p11g3teruv?zt';
export const RADIO_STREAM_VALLENATOS = 'https://stream-159.zeno.fm/y2nsu1p6ynhvv?zt';
export const RADIO_STREAM_BALADAS = 'https://stream-143.zeno.fm/ux9p55q8qeruv?zt';
export const RADIO_STREAM_FIESTA = 'https://stream-162.zeno.fm/yw5nn2g8bwbtv?zt';

export const WHATSAPP_URL = 'https://wa.me/51900758816';
export const GREETINGS_WHATSAPP = 'https://wa.me/51933067069'; // Saludos en vivo (Moderador)
export const TIKTOK_URL = 'https://www.tiktok.com/@lanueva540';
export const FACEBOOK_URL = 'https://www.facebook.com/lanueva540';
export const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@lanueva540';

export const SPOTIFY_PROFILE_URL = 'https://open.spotify.com/user/lanueva540';
export const SLOGAN = '¡La Nueva cinco cuarenta radio, la radio que manda en el barrio!';

export const ADMIN_PASSWORD = '540admin'; // Contraseña única de administración

// Scripts para la madrugada (12am - 5am) - para taxistas, camioneros, mercados, trabajadores nocturnos
export const MADRUGADA_SCRIPTS: string[] = [
    "¡Oe, oe, oe! Son las {hora} de la madrugada y aquí seguimos contigo. ¡Para todos los taxistas al volante, los camioneros en ruta, los que trabajan mientras el mundo duerme... esta señal es para ustedes! La nueva cinco cuarenta radio, tu compañía en la noche.",
    "¡Son las {hora}! ¡Arriba los guerreros de la madrugada! Al taxista que ya lleva horas en la pista, al del mercado que ya está cargando, al camionero que cruza la carretera... ¡La nueva cinco cuarenta radio está con ustedes, no están solos!",
    "¡Fuerza, fuerza! Son las {hora} y tú sigues de pie porque eres de los que no se rinden. ¡Eso es actitud peruana, causita! Sube el volumen, que la música te despierta el alma. La nueva cinco cuarenta radio, presente en tu madrugada.",
    "¡Son las {hora} y la noche sigue larga! Para el que está en el mercado armando su puesto, para el taxista esperando pasajeros, para el vigilante, para el que trabaja de madrugada... ¡Un abrazo enorme! La nueva cinco cuarenta radio no te abandona.",
    "¡Aquí no hay sueño que valga! Son las {hora}. ¡Mueve la cabeza, agita los hombros, sube ese volumen! La música es tu mejor copiloto esta madrugada. ¡Gracias por confiar en la nueva cinco cuarenta radio para acompañarte en tu chamba!",
    "¡Son las {hora} de la madrugada! ¿Ya tomaste tu cafecito? ¡Bien hecho! Tú que estás despierto mientras todos duermen eres un verdadero campeón. ¡Pa' los camioneros, los taxistas y toda la gente del mercado... esto va por ustedes! La nueva cinco cuarenta radio.",
    "¡Oe hermano, oe hermana! Son las {hora}. ¡No cierres los ojos todavía, que la noche es larga pero la señal no para! La nueva cinco cuarenta radio te mantiene despierto y con energía. ¡Eres un guerrero de la madrugada, sigue adelante!"
];

// Scripts cortos para las mañanas (hasta las 8am) - especial para los chicos que van al colegio
export const MORNING_HOURLY_SCRIPTS: string[] = [
    "¡Buenos días! Son las {hora}. ¡Arriba los chicos del colegio, hoy va a ser un gran día! La nueva cinco cuarenta radio los acompaña.",
    "¡Despierta Perú! Son las {hora}. ¡Ánimo a todos los estudiantes, al cole con buena vibra! La nueva cinco cuarenta radio.",
    "¡Son las {hora}! ¡Lonchera lista, mochila lista, actitud lista! ¡Vamos con todo al colegio! La nueva cinco cuarenta radio.",
    "¡Buenos días familia! Son las {hora}. ¡El cole espera, la música te da energía! La nueva cinco cuarenta radio, tu mañana perfecta.",
    "¡Arriba, arriba! Son las {hora}. ¡Un abrazo grande para todos los estudiantes que ya van camino al colegio! La nueva cinco cuarenta radio."
];

// Scripts para los sábados por la noche (6pm - 10pm) - invitando a las fiestas
export const SATURDAY_NIGHT_SCRIPTS: string[] = [
    "¡Oe, oe, oe! Son las {hora} del sábado y la noche recién empieza. ¡Arréglate, avísale a tu gente y sal a bailar! La nueva cinco cuarenta radio te calienta el ambiente.",
    "¡Sábado de fiesta, causita! Son las {hora} y todavía hay tiempo pa' todo. ¡Llama a tu mancha, pónganse guapos y a zapatear hasta el amanecer! La nueva cinco cuarenta radio.",
    "¡Que nadie se quede en casa este sábado! Son las {hora}. ¿Dónde está la cumbia? ¡En la pista, mi gente! Sal, baila, disfruta. La nueva cinco cuarenta radio te acompaña.",
    "¡Fuego, fuego! Son las {hora} de este sábado glorioso. ¡Las fiestas están prendidas y tú tienes que estar ahí! Avisa a los tuyos y vayan con todo. La nueva cinco cuarenta radio.",
    "¡Son las {hora} del mejor día de la semana! El sábado no perdona, mi gente. ¡La pista te espera, la cumbia te llama, tu gente ya está lista! ¡Vamos que hay fiesta! La nueva cinco cuarenta radio.",
    "¡Sábado de noche, hora de brillar! Son las {hora}. ¡Nada de quedarse en el sillón! Búscate tu mejor ropa, llama a quien quieras y a gozar se ha dicho. La nueva cinco cuarenta radio pone el sabor."
];

// Scripts para los domingos - dedicados a la familia todo el día
export const SUNDAY_FAMILY_SCRIPTS: string[] = [
    "¡Buenos días familia! Son las {hora} de este domingo especial. ¡El mejor día para estar juntos, para abrazarse y disfrutarse! La nueva cinco cuarenta radio les desea un domingo lleno de amor.",
    "¡Feliz domingo mi gente! Son las {hora}. ¡Hoy no hay apuros, hoy es día de familia! Pon la mesita, llama a los tuyos y a compartir ese almuerzo con amor. La nueva cinco cuarenta radio los acompaña.",
    "¡Son las {hora} de este hermoso domingo! ¿Ya está lista la ollita? ¡Nada como el almuerzo familiar del domingo para recargar el alma! La nueva cinco cuarenta radio, sonando en tu cocina.",
    "¡Domingo de familia, domingo de bendiciones! Son las {hora}. ¡A los papás, a las mamás, a los abuelitos, a los hijitos... un abrazo enorme de parte de la nueva cinco cuarenta radio!",
    "¡Oe mi gente! Son las {hora} de domingo. ¡El día más especial de la semana para estar con los que más quieres! Que nada ni nadie les quite esa sonrisa familiar. La nueva cinco cuarenta radio.",
    "¡Son las {hora}! ¡Domingo de reencuentros, de risas en la mesa, de historias en familia! Para todas las familias peruanas escuchándonos hoy, un saludo de corazón. La nueva cinco cuarenta radio.",
    "¡Feliz domingo! Son las {hora}. ¡Hoy la radio suena más bonito porque la familia está reunida! Un domingo sin prisa, con buena música y los tuyos al lado. La nueva cinco cuarenta radio.",
    "¡Son las {hora} de este domingo bendecido! ¡Para los que están en el almuerzo familiar, para los que ya bailaron, para los que descansan con sus seres queridos... esto va para ustedes! La nueva cinco cuarenta radio."
];

export const DEFAULT_HOURLY_SCRIPTS: string[] = [
    "¡Oe causita! El reloj no miente: son las {hora}. Y tú, sintonizando la mejor señal del Perú. ¡La nueva cinco cuarenta radio, siempre contigo!",
    "¡Que no pare la fiesta! Son las {hora} en punto y aquí seguimos, encendiendo tu día con lo mejor. ¡La nueva cinco cuarenta radio, tu compañía de siempre!",
    "¡Tiempo y música, la combinación perfecta! Marcamos las {hora} desde la cabina de la nueva cinco cuarenta radio. ¡Queda con nosotros, mi gente!",
    "¡Pasan las horas y la música no se cansa! Son las {hora}. Gracias por elegirnos hoy y siempre. ¡Esto es la nueva cinco cuarenta radio!",
    "¡Aquí no se duerme nadie! Son las {hora} y la señal sigue al cien. La nueva cinco cuarenta radio, presente las veinticuatro horas para ti."
];

export const DEFAULT_JINGLES: string[] = [
    "¡Oe mi gente! Si tu corazón late al ritmo de la cumbia, ya encontraste tu hogar. ¡La nueva cinco cuarenta radio, donde el sabor nunca se apaga!",
    "¡Arriba los que están trabajando, arriba los que están en casa, arriba toda la familia! La nueva cinco cuarenta radio los abraza a todos con su música.",
    "¡Tú me sintonizas a mí, yo te pongo lo mejor! Así de sencillo, así de rico. La nueva cinco cuarenta radio, tu frecuencia favorita.",
    "¿Buscas algo diferente? Aquí lo tienes. Música de verdad, locutores de verdad, sabor de verdad. ¡La nueva cinco cuarenta radio!",
    "¡Para el que madruga y para el que trasnocha! La nueva cinco cuarenta radio está en tu oreja, causita. ¡Sin parar!",
    "¡Oye, cuéntale a tu vecino, cuéntale a tu primo! La radio que mueve masas está aquí. ¡La nueva cinco cuarenta radio, la que manda!",
    "¡Ni el tráfico te baja el ánimo cuando tienes la nueva cinco cuarenta radio en el carro! ¡Quemamos la señal por ti, hermano!",
    "¡Tu saludo puede sonar al aire hoy mismo! Escríbenos al WhatsApp novecientos treinta y tres, cero sesenta y siete, cero sesenta y nueve. La nueva cinco cuarenta radio te escucha.",
    "¡No hay fiesta sin cumbia y no hay cumbia sin la nueva cinco cuarenta radio! ¡Eso es todo lo que necesitas saber, causita!"
];

export const MOCK_EVENTS: RadioEvent[] = [
    {
        id: '1',
        title: "Especial: Historias con 'El Popular Ceviche'",
        date: '2026-03-05T18:00:00',
        location: 'Radio Online La Nueva 5:40 radio',
        imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: '2',
        title: 'Gran Cortamonte en Huaycan',
        date: '2026-02-21T14:00:00',
        location: 'ucv 80 Zona e Huaycan',
        imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: '3',
        title: 'Día Deportivo Grupo Huerta Company',
        date: '2026-12-07T10:00:00',
        location: 'Local Deportivo Progreso',
        imageUrl: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: '4',
        title: 'Lanzamiento Oficial de la Web',
        date: '2026-02-28T00:00:00',
        location: 'Internet - Global',
        imageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: '5',
        title: 'Serenata a Orquesta la nueva 5:40 de huarochiri',
        date: '2026-03-31T20:00:00',
        location: 'Estadio Municipal',
        imageUrl: 'https://images.unsplash.com/photo-1514525253361-bee8718a74a2?auto=format&fit=crop&q=80&w=800'
    }
];

export const MOCK_VIDEOS: YouTubeVideo[] = [
    {
        id: '1',
        title: 'Música Huarochirana - Mix Especial',
        thumbnail: 'https://img.youtube.com/vi/R1VYuiiROEY/mqdefault.jpg',
        videoId: 'R1VYuiiROEY'
    },
    {
        id: '2',
        title: 'Huarochirana Mix 2',
        thumbnail: 'https://img.youtube.com/vi/qsHYdiVD8TE/mqdefault.jpg',
        videoId: 'qsHYdiVD8TE'
    },
    {
        id: '3',
        title: 'Huarochirana Mix 3',
        thumbnail: 'https://img.youtube.com/vi/F5clRJ-y4WI/mqdefault.jpg',
        videoId: 'F5clRJ-y4WI'
    },
    {
        id: '4',
        title: 'Playlist: Música Huarochirana Completa',
        thumbnail: 'https://img.youtube.com/vi/R1VYuiiROEY/mqdefault.jpg',
        videoId: 'videoseries?list=PLFQS_AuFRnTDaeH3Gk9hClLDmoQkAUBKu'
    },
    {
        id: '5',
        title: 'En Vivo: Concierto Grupo 5',
        thumbnail: 'https://img.youtube.com/vi/onJRPy7_SLY/mqdefault.jpg',
        videoId: 'onJRPy7_SLY'
    },
    {
        id: '6',
        title: 'Huarochirana Mix 4',
        thumbnail: 'https://img.youtube.com/vi/CM_aLJxsCkQ/mqdefault.jpg',
        videoId: 'CM_aLJxsCkQ'
    }
];

export const MOCK_SHORTS: RadioShort[] = [
    {
        id: 'ad-la-machi',
        title: 'Cevichería La Machi',
        thumbnail: 'https://i.postimg.cc/L57qGkVf/dfdsf.jpg',
        videoUrl: ''
    },
    {
        id: 'ad-orquesta',
        title: 'Orquesta La Nueva 5:40',
        thumbnail: 'https://i.postimg.cc/8c153KW6/cr33.png',
        videoUrl: ''
    },
    {
        id: 'ad-entrust',
        title: 'Gorras Entrust',
        thumbnail: 'https://i.postimg.cc/8CYPr3hg/a-S.jpg',
        videoUrl: ''
    }
];

export const LA_MACHI_DIALOGUES = [
    { speaker: 'dj1', text: '¡Habla, barrio! ¿Se te antojó su cevichito? ¡No busques más! Tu punto fijo es Cevichería La Machi. Aquí el pescado salta del mar a tu mesa con su buen toque de limón.' },
    { speaker: 'dj2', text: '¡Así es batería! Las palmas para el maestro Arturo Condori Nolazco, el encargado de ponerle la verdadera sazón que levanta a cualquiera. ¡Qué rico!' },
    { speaker: 'dj1', text: 'Ya sabes, cae con tu mancha al Mercado Las Malvinas del Sur, en Valdiviezo, Ate. Cevichería La Machi... poniendo el sabor como auspiciador oficial de La Nueva cinco cuarenta Radio.' }
];

export const ORQUESTA_DIALOGUES = [
    { speaker: 'dj2', text: '¡Que no te cuenten, vívelo tú mismo! Para que tu compromiso sea inolvidable, ponle el marco musical que todos prefieren: ¡la poderosa Orquesta La Nueva cinco cuarenta! De María Llata y José Mitma.' },
    { speaker: 'dj1', text: '¡Eso! Desde Huarochirí para todo el Perú y el mundo, somos especialistas en hacer vibrar tus fiestas patronales, matrimonios y aniversarios.' },
    { speaker: 'dj2', text: '¡Pura saxocumbia de la buena para zapatear sin parar! Para contratos, comunícate al 9 tres tres 0 seis siete 0 seis nueve o al 9 cero cero 7 cinco ocho 8 uno seis.' },
    { speaker: 'dj1', text: '¡Orquesta La Nueva cinco cuarenta... el alma de tu fiesta!' }
];

export const ENTRUST_DIALOGUES = [
    { speaker: 'dj1', text: '¡Así es barrio! Marca tu propio estilo con la verdadera calidad de Gorras Entrust. ¡Eso sí es otra cosa!' },
    { speaker: 'dj2', text: '¡Claro que sí, batería! Visítanos en el corazón de La Victoria: Jirón Antonio Bazo 1284. Calidad que se nota a leguas.' },
    { speaker: 'dj1', text: 'Para pedidos, catálogo o envíos, escribe al WhatsApp 9 6 cero, 8 3 cero, 3 cero 5. ¡Anota bien! 960 830 305.' },
    { speaker: 'dj2', text: 'Gorras Entrust... ¡Auspiciador oficial de La Nueva cinco cuarenta Radio! La que manda en el barrio.' }
];

export const MOCK_TRACKS: MusicTrack[] = [
    {
        id: '1',
        title: 'Acuérdate de Mi',
        artist: 'La Nueva 5:40',
        url: 'https://res.cloudinary.com/drudckg9t/video/upload/v1769640245/01-ACUERDATE_DE_MI_hgmytr.mp3'
    },
    {
        id: '2',
        title: 'A San Francisco',
        artist: 'La Nueva 5:40',
        url: 'https://res.cloudinary.com/drudckg9t/video/upload/v1769640245/02-A_SAN_FRANCISCO_eajyw0.mp3'
    },
    {
        id: '3',
        title: 'Ponchito de Colores',
        artist: 'La Nueva 5:40',
        url: 'https://res.cloudinary.com/drudckg9t/video/upload/v1769640253/03-PONCHITO_DE_COLORES_txctip.mp3'
    },
    {
        id: '4',
        title: 'La Vanidosa',
        artist: 'La Nueva 5:40',
        url: 'https://res.cloudinary.com/drudckg9t/video/upload/v1769640253/04-LA_VANIDOSA_bvzwa3.mp3'
    },
    {
        id: '5',
        title: 'El Borrachito',
        artist: 'La Nueva 5:40',
        url: 'https://res.cloudinary.com/drudckg9t/video/upload/v1769640245/05-EL_BORRACHITO_dt5p2b.mp3'
    },
    {
        id: '6',
        title: 'La Flor',
        artist: 'La Nueva 5:40',
        url: 'https://res.cloudinary.com/drudckg9t/video/upload/v1769640245/06-LA_FLOR_bajlql.mp3'
    }
];

export const MOCK_POLLS: RadioPoll[] = [
    {
        id: '1',
        question: '¿Qué género quieres escuchar ahora?',
        totalVotes: 145,
        options: [
            { id: '1', text: 'Cumbia Sanjuanera', votes: 65 },
            { id: '2', text: 'Huayno con Arpa', votes: 50 },
            { id: '3', text: 'Salsa del Recuerdo', votes: 30 }
        ]
    }
];

// Banco de preguntas para votaciones diarias automáticas
export interface AutoPollQuestion {
    id: string;
    question: string;
    options: string[];
    category: string;
}

export const POLL_QUESTIONS_BANK: AutoPollQuestion[] = [
    // Género Musical
    { id: 'q1', category: 'genero', question: '¿Qué género quieres escuchar hoy?', options: ['Cumbia', 'Salsa', 'Huayno'] },
    { id: 'q2', category: 'genero', question: '¿Con qué ritmo arrancamos el día?', options: ['Cumbia Norteña', 'Chicha', 'Tropical'] },
    { id: 'q3', category: 'genero', question: '¿Qué música te pone de buen humor?', options: ['Cumbia Sanjuanera', 'Salsa Romántica', 'Huayno Moderno'] },
    { id: 'q4', category: 'genero', question: '¿Qué género manda en tu barrio?', options: ['Cumbia Peruana', 'Chicha de Oro', 'Salsa Dura'] },

    // Artistas
    { id: 'q5', category: 'artista', question: '¿Cuál es tu grupo favorito?', options: ['Grupo 5', 'Armonía 10', 'Agua Marina'] },
    { id: 'q6', category: 'artista', question: '¿Quién es el rey de la cumbia?', options: ['Grupo 5', 'Corazón Serrano', 'Los Hermanos Yaipén'] },
    { id: 'q7', category: 'artista', question: '¿A quién quieres escuchar?', options: ['Armonía 10', 'Néctar', 'Papillón'] },
    { id: 'q8', category: 'artista', question: '¿Cuál artista te hace bailar más?', options: ['Agua Marina', 'Grupo Néctar', 'Los Shapis'] },

    // Preferencias
    { id: 'q9', category: 'preferencia', question: '¿A qué hora escuchas más la radio?', options: ['Mañana', 'Tarde', 'Noche'] },
    { id: 'q10', category: 'preferencia', question: '¿Cómo prefieres escuchar la radio?', options: ['Celular', 'Parlante', 'Computadora'] },
    { id: 'q11', category: 'preferencia', question: '¿Con quién escuchas la radio?', options: ['Solo/a', 'Familia', 'Amigos'] },
    { id: 'q12', category: 'preferencia', question: '¿Dónde escuchas la 5:40?', options: ['Casa', 'Trabajo', 'En la calle'] },

    // Programación
    { id: 'q13', category: 'programa', question: '¿Qué programa te gusta más?', options: ['Musical en vivo', 'Saluditos', 'Noticias del barrio'] },
    { id: 'q14', category: 'programa', question: '¿Qué quieres más en la radio?', options: ['Más cumbia', 'Más saluditos', 'Más eventos'] },
    { id: 'q15', category: 'programa', question: '¿Cuántas horas escuchas al día?', options: ['1-2 horas', '3-4 horas', 'Todo el día'] },

    // Opinión
    { id: 'q16', category: 'opinion', question: '¿Cómo está el ánimo hoy?', options: ['De fiesta 🎉', 'Tranquilo 😌', 'Romántico 💕'] },
    { id: 'q17', category: 'opinion', question: '¿Qué día es mejor para bailar?', options: ['Viernes', 'Sábado', 'Domingo'] },
    { id: 'q18', category: 'opinion', question: '¿Cumbia clásica o moderna?', options: ['Clásica de siempre', 'Moderna actual', 'Las dos'] },
    { id: 'q19', category: 'opinion', question: '¿Te gustan los eventos en vivo?', options: ['¡Me encantan!', 'A veces', 'Prefiero escuchar'] },
    { id: 'q20', category: 'opinion', question: '¿Qué te gusta más de la 5:40?', options: ['La música', 'Los locutores', 'El ambiente familiar'] }
];

export const STARTUP_COMMERCIAL_TEXT = "¡Habla, barrio! ¿Se te antojó su cevichito? ¡No busques más! Tu punto fijo es Cevichería La Machi. Aquí el pescado salta del mar a tu mesa con su buen toque de limón. Las palmas para el maestro Arturo Condori Nolazco, el encargado de ponerle la verdadera sazón que levanta a cualquiera. Cae con tu mancha al Mercado Las Malvinas del Sur, en Valdiviezo, Ate. Cevichería La Machi... poniendo el sabor como auspiciador oficial de La Nueva cinco cuarenta Radio.";
export const STARTUP_ORQUESTA_TEXT = "¡Que no te cuenten, vívelo tú mismo! Para que tu compromiso sea inolvidable, ponle el marco musical que todos prefieren: ¡la poderosa Orquesta La Nueva cinco cuarenta! De María Llata y José Mitma. Desde Huarochirí para todo el Perú y el mundo, somos especialistas en hacer vibrar tus fiestas patronales, matrimonios y aniversarios. ¡Pura saxocumbia de la buena para zapatear sin parar! Para contratos, comunícate al 933 067 069 o al 900 758 816. ¡Orquesta La Nueva cinco cuarenta... el alma de tu fiesta!";
export const STARTUP_ENTRUST_TEXT = "¡Así es! Marca tu propio estilo con la verdadera calidad de Gorras Entrust. Visítanos en el corazón de La Victoria: Jirón Antonio Bazo 1284. Para pedidos, catálogo o envíos, escribe al WhatsApp 960 830 305. ¡Anota bien! 960 830 305. Gorras Entrust... ¡Auspiciador oficial de La Nueva cinco cuarenta Radio!";

