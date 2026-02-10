import React, { useState, useEffect } from 'react';
import { NavTab } from '../types';

const SettingsView: React.FC = () => {
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [pin, setPin] = useState('');
    const [error, setError] = useState('');

    const ADMIN_PIN = '5540'; // PIN: 5540

    const handleUnlock = (e: React.FormEvent) => {
        e.preventDefault();
        if (pin === ADMIN_PIN) {
            setIsUnlocked(true);
            setError('');
            localStorage.setItem('settings_unlocked', 'true');
        } else {
            setError('PIN incorrecto');
            setPin('');
        }
    };

    const navigateToGreetings = () => {
        window.dispatchEvent(new CustomEvent('navigate_to_tab', { detail: NavTab.GREETINGS }));
    };

    // Check if already unlocked in this session
    useEffect(() => {
        const unlocked = localStorage.getItem('settings_unlocked');
        if (unlocked === 'true') {
            setIsUnlocked(true);
        }
    }, []);

    // PIN SCREEN
    if (!isUnlocked) {
        return (
            <div className="min-h-screen flex items-center justify-center px-4 pb-32">
                <div className="w-full max-w-md">
                    <div className="glass-dark rounded-3xl p-8 border border-white/10 space-y-6">
                        {/* Lock Icon */}
                        <div className="flex justify-center">
                            <div className="w-20 h-20 bg-gradient-to-br from-[#a3cf33] to-yellow-400 rounded-full flex items-center justify-center">
                                <i className="fa-solid fa-lock text-4xl text-slate-900"></i>
                            </div>
                        </div>

                        {/* Title */}
                        <div className="text-center space-y-2">
                            <h2 className="text-white font-black text-2xl uppercase">
                                Panel Admin
                            </h2>
                            <p className="text-slate-400 text-sm">
                                Ingresa el PIN de 4 dígitos
                            </p>
                        </div>

                        {/* PIN Form */}
                        <form onSubmit={handleUnlock} className="space-y-4">
                            <input
                                type="password"
                                inputMode="numeric"
                                maxLength={4}
                                value={pin}
                                onChange={(e) => setPin(e.target.value.replace(/\D/g, ''))}
                                placeholder="••••"
                                className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-center text-white text-3xl font-bold tracking-[0.5em] focus:outline-none focus:border-[#a3cf33] transition-colors"
                                autoFocus
                            />

                            {error && (
                                <div className="bg-red-500/10 border border-red-500/20 rounded-2xl px-4 py-3 text-center">
                                    <p className="text-red-400 text-sm font-bold">
                                        <i className="fa-solid fa-circle-exclamation mr-2"></i>
                                        {error}
                                    </p>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={pin.length !== 4}
                                className="w-full bg-gradient-to-r from-[#a3cf33] to-yellow-400 text-slate-900 font-black py-4 rounded-2xl uppercase tracking-widest hover:scale-105 transition-all disabled:opacity-50 disabled:hover:scale-100"
                            >
                                Desbloquear
                            </button>
                        </form>

                        {/* Hint */}
                        <p className="text-center text-slate-600 text-xs">
                            Contacta al administrador si olvidaste el PIN
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    // ADMIN PANEL (unlocked)
    return (
        <div className="space-y-8 animate-fadeIn pb-32 max-w-4xl mx-auto px-4">
            {/* HEADER */}
            <header className="text-center space-y-4">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-slate-400 text-xs font-black uppercase tracking-[0.3em] backdrop-blur-xl mb-4">
                    <i className="fa-solid fa-unlock text-lg text-[#a3cf33]"></i>
                    Panel de Control Desbloqueado
                </div>

                <h1 className="text-5xl md:text-6xl font-black text-white uppercase tracking-tighter">
                    Admin <span className="bg-gradient-to-r from-[#a3cf33] to-yellow-400 bg-clip-text text-transparent">Settings</span>
                </h1>
            </header>

            {/* ADMIN SHORTCUTS */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* SALUDITOS AL AIRE */}
                <button
                    onClick={navigateToGreetings}
                    className="relative group overflow-hidden rounded-3xl p-8 text-left transition-all hover:scale-105"
                >
                    <div className="absolute inset-0 bg-gradient-to-br from-green-600/20 via-[#10B981]/10 to-emerald-600/20 animate-gradient"></div>
                    <div className="absolute inset-0 backdrop-blur-3xl border border-green-500/20 rounded-3xl"></div>

                    <div className="relative z-10 space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-2xl flex items-center justify-center text-3xl">
                            🎙️
                        </div>

                        <div>
                            <h3 className="text-white font-black text-2xl uppercase mb-2">
                                Saluditos Al Aire
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed">
                                Gestiona y lee saludos de oyentes con voz AI profesional
                            </p>
                        </div>

                        <div className="flex items-center gap-2 text-green-400 font-bold text-sm">
                            <span>Abrir Panel</span>
                            <i className="fa-solid fa-arrow-right group-hover:translate-x-2 transition-transform"></i>
                        </div>
                    </div>
                </button>

                {/* INFO DE LA APP */}
                <div className="relative overflow-hidden rounded-3xl p-8 text-left">
                    <div className="absolute inset-0 bg-white/5"></div>
                    <div className="absolute inset-0 backdrop-blur-3xl border border-white/10 rounded-3xl"></div>

                    <div className="relative z-10 space-y-4">
                        <div className="w-16 h-16 bg-gradient-to-br from-[#a3cf33] to-yellow-400 rounded-2xl flex items-center justify-center text-3xl">
                            📻
                        </div>

                        <div>
                            <h3 className="text-white font-black text-2xl uppercase mb-2">
                                Info de la App
                            </h3>
                            <p className="text-slate-400 text-sm leading-relaxed mb-4">
                                La Nueva 5:40 - Radio en Vivo
                            </p>

                            <div className="space-y-2 text-xs">
                                <p className="text-slate-500">
                                    <span className="text-[#a3cf33] font-bold">Versión:</span> 2.0.0
                                </p>
                                <p className="text-slate-500">
                                    <span className="text-[#a3cf33] font-bold">Optimizaciones:</span> Lazy Loading, Service Worker
                                </p>
                                <p className="text-slate-500">
                                    <span className="text-[#a3cf33] font-bold">Features:</span> DJ AI, Voz Gemini, Saludos en Vivo
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* QUICK STATS */}
            <div className="glass-dark rounded-3xl p-6 border border-white/10">
                <h3 className="text-white font-black text-lg uppercase mb-4 flex items-center gap-2">
                    <i className="fa-solid fa-chart-simple text-[#a3cf33]"></i>
                    Accesos Rápidos
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="text-center p-4 bg-white/5 rounded-2xl">
                        <p className="text-2xl font-black text-[#a3cf33] mb-1">📱</p>
                        <p className="text-slate-400 text-xs font-bold">WhatsApp Saludos</p>
                        <p className="text-white text-sm font-black mt-1">930-404-573</p>
                    </div>

                    <div className="text-center p-4 bg-white/5 rounded-2xl">
                        <p className="text-2xl font-black text-blue-400 mb-1">🤖</p>
                        <p className="text-slate-400 text-xs font-bold">DJ AI</p>
                        <p className="text-white text-sm font-black mt-1">Activo</p>
                    </div>

                    <div className="text-center p-4 bg-white/5 rounded-2xl">
                        <p className="text-2xl font-black text-purple-400 mb-1">🎵</p>
                        <p className="text-slate-400 text-xs font-bold">Señales</p>
                        <p className="text-white text-sm font-black mt-1">3 Activas</p>
                    </div>

                    <div className="text-center p-4 bg-white/5 rounded-2xl">
                        <p className="text-2xl font-black text-orange-400 mb-1">⚡</p>
                        <p className="text-slate-400 text-xs font-bold">Performance</p>
                        <p className="text-white text-sm font-black mt-1">Optimizado</p>
                    </div>
                </div>
            </div>

            {/* Logout Button */}
            <div className="flex justify-center">
                <button
                    onClick={() => {
                        localStorage.removeItem('settings_unlocked');
                        setIsUnlocked(false);
                        setPin('');
                    }}
                    className="px-6 py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-slate-400 hover:text-white text-sm font-bold uppercase tracking-widest transition-all"
                >
                    <i className="fa-solid fa-right-from-bracket mr-2"></i>
                    Cerrar Sesión
                </button>
            </div>
        </div>
    );
};

export default SettingsView;
