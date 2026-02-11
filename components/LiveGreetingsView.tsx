import React, { useState, useEffect, useRef } from 'react';
import { LiveGreeting } from '../types';
import { GREETINGS_WHATSAPP, ADMIN_PASSWORD } from '../constants';
import { generateGeminiSpeech, decodeGeminiAudio, playGeminiAudio } from '../services/geminiTTSService';
import { broadcastGreeting } from '../services/supabase';

const LiveGreetingsView: React.FC = () => {
    const [greetings, setGreetings] = useState<LiveGreeting[]>([]);
    const [showForm, setShowForm] = useState(false);
    const [formData, setFormData] = useState({ from: '', to: '', message: '' });
    const [activeGreeting, setActiveGreeting] = useState<string | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);

    // Auth State
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [password, setPassword] = useState('');
    const [authError, setAuthError] = useState(false);

    const audioCtxRef = useRef<AudioContext | null>(null);
    const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

    const checkAuth = () => {
        if (password === ADMIN_PASSWORD) {
            setIsAuthenticated(true);
            setAuthError(false);
        } else {
            setAuthError(true);
        }
    };

    useEffect(() => {
        const saved = localStorage.getItem('radio_greetings');
        if (saved) {
            setGreetings(JSON.parse(saved));
        }
    }, []);

    useEffect(() => {
        if (greetings.length > 0) {
            localStorage.setItem('radio_greetings', JSON.stringify(greetings));
        }
    }, [greetings]);

    const addGreeting = () => {
        if (!formData.from.trim() || !formData.to.trim()) {
            alert('Por favor completa "De" y "Para"');
            return;
        }

        const newGreeting: LiveGreeting = {
            id: Date.now().toString(),
            from: formData.from.trim(),
            to: formData.to.trim(),
            message: formData.message.trim() || undefined,
            status: 'pending',
            timestamp: new Date().toISOString()
        };

        setGreetings([newGreeting, ...greetings]);
        setFormData({ from: '', to: '', message: '' });
        setShowForm(false);
    };

    const readGreeting = async (greeting: LiveGreeting) => {
        if (!audioCtxRef.current) {
            audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
        }
        if (audioCtxRef.current.state === 'suspended') {
            await audioCtxRef.current.resume();
        }

        setIsGenerating(true);
        setActiveGreeting(greeting.id);

        // Construir el texto del saludo
        const greetingText = greeting.message
            ? `¡Tenemos un saludo! Para ${greeting.to}, de parte de ${greeting.from}. ${greeting.message}. ¡Un abrazo grande!`
            : `¡Tenemos un saludo! Para ${greeting.to}, de parte de ${greeting.from}. ¡Un abrazo grande!`;

        try {
            // EN LUGAR DE REPRODUCIR LOCALMENTE, HACEMOS BROADCAST
            setIsGenerating(true);

            // 1. Actualizar estado local a "reading" para feedback inmediato
            setGreetings(greetings.map(g =>
                g.id === greeting.id ? { ...g, status: 'reading' } : g
            ));

            // 2. Transmitir a todos los oyentes (incluido este admin si escucha la radio por app)
            await broadcastGreeting(greeting);

            // 3. Simular tiempo de lectura para UX del admin y luego marcar como completado
            setTimeout(() => {
                setGreetings(greetings.map(g =>
                    g.id === greeting.id ? { ...g, status: 'completed' } : g
                ));
                setActiveGreeting(null);
                setIsGenerating(false);
            }, 10000); // 10 segundos aprox de espera visual

        } catch (error) {
            console.error('Error broadcasting greeting:', error);
            setIsGenerating(false);
            setActiveGreeting(null);
            alert('Error al transmitir saludo');
        }
    };

    const stopReading = () => {
        if (audioSourceRef.current) {
            audioSourceRef.current.stop();
            audioSourceRef.current = null;
        }
        setActiveGreeting(null);
        setIsGenerating(false);
        // Restaurar volumen
        window.dispatchEvent(new CustomEvent('radio_volume_change', { detail: { level: 0.8 } }));
    };

    const rejectGreeting = (id: string) => {
        setGreetings(greetings.map(g =>
            g.id === id ? { ...g, status: 'rejected' } : g
        ));
    };

    const deleteGreeting = (id: string) => {
        setGreetings(greetings.filter(g => g.id !== id));
    };

    const pendingGreetings = greetings.filter(g => g.status === 'pending');
    const completedGreetings = greetings.filter(g => g.status === 'completed');
    const todayCompleted = completedGreetings.filter(g => {
        const greetingDate = new Date(g.timestamp).toDateString();
        const today = new Date().toDateString();
        return greetingDate === today;
    });

    return (
        <div className="space-y-8 animate-fadeIn pb-32 max-w-4xl mx-auto px-4">
            {/* HEADER */}
            <header className="relative text-center space-y-6 overflow-hidden rounded-[3rem] p-8 md:p-12">
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 via-[#a3cf33]/10 to-blue-600/20 animate-gradient"></div>
                <div className="absolute inset-0 backdrop-blur-3xl"></div>

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-green-600/30 to-[#a3cf33]/30 border border-green-500/40 rounded-full text-green-200 text-xs font-black uppercase tracking-[0.3em] backdrop-blur-xl mb-4">
                        <i className="fa-solid fa-microphone-lines text-lg"></i>
                        Saludos en Vivo
                    </div>

                    <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter mb-4">
                        Saluditos <span className="bg-gradient-to-r from-[#a3cf33] to-green-400 bg-clip-text text-transparent">Al Aire</span>
                    </h1>

                    <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed mb-6">
                        📱 Envía tu saludo por WhatsApp y lo leeremos al aire con voz AI profesional
                    </p>

                    <a
                        href={`${GREETINGS_WHATSAPP}?text=${encodeURIComponent("¡Hola! 👋 Bienvenido a La Nueva 5:40.\n\nTu saludo ya está en cola para ser leído por nuestra IA. 🤖\n\n⚠️ Ojo: Por favor escribe solo TEXTO, no envíes audios.\n\nEscúchanos en vivo aquí: 👇\n🔗 https://radioficial540.netlify.app/")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-[#25D366] to-[#20bd5a] text-white font-black rounded-2xl text-sm uppercase tracking-widest hover:shadow-lg hover:shadow-green-500/50 transition-all"
                    >
                        <i className="fa-brands fa-whatsapp text-2xl"></i>
                        930-404-573
                    </a>
                </div>
            </header>

            {!isAuthenticated ? (
                <div className="max-w-md mx-auto glass-dark p-8 rounded-3xl border border-white/10 text-center space-y-6">
                    <div className="w-16 h-16 bg-[#a3cf33]/20 rounded-full flex items-center justify-center mx-auto">
                        <i className="fa-solid fa-lock text-2xl text-[#a3cf33]"></i>
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase">Acceso Restringido</h2>
                    <p className="text-slate-400 text-sm">Ingresa la contraseña para administrar los saludos en vivo.</p>

                    <div className="space-y-4">
                        <input
                            type="password"
                            placeholder="Contraseña..."
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-center text-white placeholder-slate-600 focus:outline-none focus:border-[#a3cf33] transition-all text-lg tracking-widest"
                        />
                        {authError && <p className="text-red-500 text-xs font-bold uppercase animate-pulse">Contraseña Incorrecta</p>}

                        <button
                            onClick={checkAuth}
                            className="w-full py-4 bg-white text-black font-black rounded-2xl text-sm uppercase tracking-widest hover:bg-[#a3cf33] transition-all"
                        >
                            Ingresar
                        </button>
                    </div>
                </div>
            ) : (
                <>
                    {/* ADMIN PANEL */}

                    {/* ON AIR INDICATOR */}
                    {activeGreeting && (
                        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-bounce">
                            <div className="bg-red-600 text-white px-8 py-3 rounded-full font-black text-xl shadow-[0_0_50px_rgba(220,38,38,0.8)] border-4 border-white/20 flex items-center gap-4 uppercase tracking-widest">
                                <span className="w-4 h-4 bg-white rounded-full animate-ping"></span>
                                DJ 5:40 AL AIRE
                                <i className="fa-solid fa-tower-broadcast animate-pulse"></i>
                            </div>
                        </div>
                    )}

                    {/* STATS */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-yellow-400/20 to-orange-400/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
                            <div className="relative text-center p-6 glass-dark rounded-3xl border border-white/10 backdrop-blur-xl">
                                <p className="text-4xl font-black bg-gradient-to-br from-yellow-400 to-orange-400 bg-clip-text text-transparent">{pendingGreetings.length}</p>
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-2">Pendientes</p>
                            </div>
                        </div>

                        <div className="relative group">
                            <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
                            <div className="relative text-center p-6 glass-dark rounded-3xl border border-white/10 backdrop-blur-xl">
                                <p className="text-4xl font-black bg-gradient-to-br from-green-400 to-emerald-400 bg-clip-text text-transparent">{todayCompleted.length}</p>
                                <p className="text-xs font-black text-slate-500 uppercase tracking-widest mt-2">Leídos Hoy</p>
                            </div>
                        </div>
                    </div>

                    {/* NUEVO SALUDO */}
                    <button
                        onClick={() => setShowForm(!showForm)}
                        className="w-full py-5 bg-gradient-to-r from-[#a3cf33] to-green-400 text-black font-black rounded-2xl text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-105 transition-all"
                    >
                        <i className={`fa-solid ${showForm ? 'fa-xmark' : 'fa-plus'} text-xl`}></i>
                        {showForm ? 'Cancelar' : 'Nuevo Saludo Manual'}
                    </button>

                    {showForm && (
                        <div className="glass-dark rounded-3xl p-6 border border-white/10 backdrop-blur-xl space-y-4 animate-scaleIn">
                            <input
                                type="text"
                                placeholder="De parte de..."
                                value={formData.from}
                                onChange={(e) => setFormData({ ...formData, from: e.target.value })}
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-[#a3cf33] transition-all"
                            />
                            <input
                                type="text"
                                placeholder="Para..."
                                value={formData.to}
                                onChange={(e) => setFormData({ ...formData, to: e.target.value })}
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-[#a3cf33] transition-all"
                            />
                            <textarea
                                placeholder="Mensaje (opcional)..."
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                rows={3}
                                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:border-[#a3cf33] transition-all resize-none"
                            />
                            <button
                                onClick={addGreeting}
                                className="w-full py-4 bg-gradient-to-r from-[#a3cf33] to-green-400 text-black font-black rounded-2xl text-sm uppercase tracking-widest hover:scale-105 transition-all"
                            >
                                <i className="fa-solid fa-check mr-2"></i>
                                Agregar Saludo
                            </button>
                        </div>
                    )}

                    {/* PENDIENTES */}
                    {pendingGreetings.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-black text-[#a3cf33] uppercase flex items-center gap-3">
                                <i className="fa-solid fa-hourglass-half"></i>
                                Pendientes ({pendingGreetings.length})
                            </h2>

                            {pendingGreetings.map((greeting) => (
                                <div
                                    key={greeting.id}
                                    className={`glass-dark rounded-3xl p-6 border transition-all ${activeGreeting === greeting.id
                                        ? 'border-[#a3cf33] scale-105 shadow-lg shadow-[#a3cf33]/30'
                                        : 'border-white/10 hover:border-white/20'
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-4">
                                        <div className="flex-1 space-y-2">
                                            <div className="flex items-center gap-2 text-[#a3cf33] font-bold">
                                                <i className="fa-solid fa-arrow-right"></i>
                                                <span>Para: {greeting.to}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                <i className="fa-solid fa-user"></i>
                                                <span>De: {greeting.from}</span>
                                            </div>
                                            {greeting.message && (
                                                <p className="text-slate-300 text-sm italic pl-6">"{greeting.message}"</p>
                                            )}
                                        </div>

                                        <div className="flex gap-2">
                                            {activeGreeting === greeting.id ? (
                                                <button
                                                    onClick={stopReading}
                                                    className="px-6 py-3 bg-red-500 text-white font-black rounded-xl text-xs uppercase hover:bg-red-600 transition-all flex items-center gap-2"
                                                >
                                                    <i className="fa-solid fa-stop"></i>
                                                    {isGenerating ? 'Generando...' : 'Detener'}
                                                </button>
                                            ) : (
                                                <>
                                                    <button
                                                        onClick={() => readGreeting(greeting)}
                                                        className="px-6 py-3 bg-gradient-to-r from-[#a3cf33] to-green-400 text-black font-black rounded-xl text-xs uppercase hover:scale-105 transition-all flex items-center gap-2"
                                                    >
                                                        <i className="fa-solid fa-microphone-lines"></i>
                                                        Leer
                                                    </button>
                                                    <button
                                                        onClick={() => rejectGreeting(greeting.id)}
                                                        className="px-4 py-3 bg-white/10 text-slate-400 rounded-xl hover:bg-red-500/20 hover:text-red-400 transition-all"
                                                    >
                                                        <i className="fa-solid fa-xmark"></i>
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* COMPLETADOS HOY */}
                    {todayCompleted.length > 0 && (
                        <div className="space-y-4">
                            <h2 className="text-2xl font-black text-green-400 uppercase flex items-center gap-3">
                                <i className="fa-solid fa-check-circle"></i>
                                Leídos Hoy ({todayCompleted.length})
                            </h2>

                            {todayCompleted.map((greeting) => (
                                <div
                                    key={greeting.id}
                                    className="glass-dark rounded-3xl p-4 border border-white/5 opacity-60 hover:opacity-100 transition-all"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center gap-2 text-green-400 text-sm font-bold">
                                                <i className="fa-solid fa-check"></i>
                                                <span>Para: {greeting.to} (de {greeting.from})</span>
                                            </div>
                                            {greeting.message && (
                                                <p className="text-slate-400 text-xs pl-6">"{greeting.message}"</p>
                                            )}
                                        </div>
                                        <button
                                            onClick={() => deleteGreeting(greeting.id)}
                                            className="px-3 py-2 text-slate-600 hover:text-red-400 transition-all"
                                        >
                                            <i className="fa-solid fa-trash text-sm"></i>
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {greetings.length === 0 && (
                        <div className="text-center py-20 glass-dark rounded-[3rem] border border-white/5 backdrop-blur-xl">
                            <i className="fa-solid fa-heart text-6xl text-slate-700 mb-6"></i>
                            <p className="text-slate-500 text-base font-bold mb-4">No hay saludos todavía</p>
                            <p className="text-slate-600 text-sm">Agrega uno manualmente o espera a que lleguen por WhatsApp</p>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default LiveGreetingsView;
