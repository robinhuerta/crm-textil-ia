
import { RadioEvent, YouTubeVideo, RadioShort, MusicTrack, RadioPoll } from './types';

export const RADIO_STREAM_URL = 'https://stream.zeno.fm/2bn9rmgylhpvv';
export const RADIO_STREAM_CUMBIAS = 'https://stream-145.zeno.fm/ut46b6drneruv?zt';
export const RADIO_STREAM_HUAYNOS = 'https://stream.zeno.fm/eiev8ylwugruv';

export const WHATSAPP_URL = 'https://wa.me/51900758816';
export const GREETINGS_WHATSAPP = 'https://wa.me/51930404573'; // Saludos en vivo
export const TIKTOK_URL = 'https://www.tiktok.com/@lanueva540';
export const FACEBOOK_URL = 'https://www.facebook.com/lanueva540';
export const YOUTUBE_CHANNEL_URL = 'https://www.youtube.com/@lanueva540';

export const SPOTIFY_PROFILE_URL = 'https://open.spotify.com/user/lanueva540';
export const SLOGAN = '¡La Nueva 5:40, la radio que manda en el barrio!';

export const DEFAULT_HOURLY_SCRIPTS: string[] = [
    "¡Habla barrio! La música no para en la 5:40. Son las {hora}. ¡Súbele todo!",
    "¡Fuego en la cabina! Sintonía total en todo el Perú. Marcamos las {hora}.",
    "La Nueva 5:40 te informa la hora oficial: las {hora}. ¡Esa es la que manda!",
    "¡Qué rico suena! Estamos en vivo acompañándote. Ya son las {hora}."
];

export const DEFAULT_JINGLES: string[] = [
    "¡La Nueva 5:40, la radio que manda en el barrio!",
    "¡Sabor, ritmo y sentimiento... en la 5:40!",
    "¡La Nueva 5:40... simplemente la mejor, causa!",
    "¡No busques más, quédate con la verdadera: La Nueva 5:40!",
    "¡Puro fuego, pura cumbia, pura 5:40!",
    "¡No esperes más! Escribe tu saludo al WhatsApp... 930-404-573. Nuestra nueva voz virtual lo lee al aire... ¡al toque! Tú escribes, nosotros sonamos. La Nueva 5:40 Radio."
];

export const MOCK_EVENTS: RadioEvent[] = [
    {
        id: '6',
        title: '🎉 Aniversario Mercado 14 de Febrero - Día del Amor y la Amistad',
        date: '2026-02-14T18:00:00',
        location: 'Mercado 14 de Febrero de Valdiviezo',
        imageUrl: 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=800',
        description: '¡Celebramos el Día del Amor y la Amistad con todo! Aniversario del Mercado 14 de Febrero de Valdiviezo, amenizado por la potente orquesta La Nueva 5:40 de Josecito Mitma y María Llata. ¡No te lo pierdas!'
    },
    {
        id: '1',
        title: "Especial: Historias con 'El Popular Ceviche'",
        date: '2026-02-05T18:00:00',
        location: 'Radio Online La Nueva 5:40',
        imageUrl: 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: '2',
        title: 'Gran Cortamonte en Ticapampa',
        date: '2026-03-15T14:00:00',
        location: 'Plaza de Armas de Ticapampa',
        imageUrl: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?auto=format&fit=crop&q=80&w=800'
    },
    {
        id: '3',
        title: 'Día Deportivo Grupo Huerta Company',
        date: '2025-12-07T10:00:00',
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
        title: 'Serenata a Huarochirí',
        date: '2026-01-15T20:00:00',
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

export const MOCK_SHORTS: RadioShort[] = [];

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
