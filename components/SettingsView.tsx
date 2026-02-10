import React from 'react';
import { NavTab } from '../types';

const SettingsView: React.FC = () => {
    const navigateToGreetings = () => {
        window.dispatchEvent(new CustomEvent('navigate_to_tab', { detail: NavTab.GREETINGS }));
    };

    return (
        <div className="space-y-8 animate-fadeIn pb-32 max-w-4xl mx-auto px-4">
            {/* HEADER */}
            <header className="text-center space-y-4">
                <div className="inline-flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-full text-slate-400 text-xs font-black uppercase tracking-[0.3em] backdrop-blur-xl mb-4">
                    <i className="fa-solid fa-gear text-lg"></i>
                    Panel de Control
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
        </div>
    );
};

export default SettingsView;
