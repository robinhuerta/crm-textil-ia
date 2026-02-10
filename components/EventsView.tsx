
import React, { useState, useEffect } from 'react';
import { RadioEvent } from '../types';
import { MOCK_EVENTS, WHATSAPP_URL } from '../constants';

interface CountdownTime {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

const getCountdown = (dateStr: string): CountdownTime => {
  const now = new Date().getTime();
  const target = new Date(dateStr).getTime();
  const diff = target - now;

  if (diff <= 0) return { days: 0, hours: 0, minutes: 0, seconds: 0, expired: true };

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
    minutes: Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60)),
    seconds: Math.floor((diff % (1000 * 60)) / 1000),
    expired: false
  };
};

const EventsView: React.FC = () => {
  const [events, setEvents] = useState<RadioEvent[]>([]);
  const [countdowns, setCountdowns] = useState<Record<string, CountdownTime>>({});
  const [filter, setFilter] = useState<'all' | 'upcoming' | 'past'>('all');
  const [selectedEvent, setSelectedEvent] = useState<RadioEvent | null>(null);

  const loadEvents = () => {
    localStorage.removeItem('radio_events');
    const list = MOCK_EVENTS;
    const sorted = [...list].sort((a: RadioEvent, b: RadioEvent) =>
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    setEvents(sorted);
  };

  useEffect(() => {
    loadEvents();
    window.addEventListener('radio_content_updated', loadEvents);
    return () => window.removeEventListener('radio_content_updated', loadEvents);
  }, []);

  useEffect(() => {
    const updateCountdowns = () => {
      const newCountdowns: Record<string, CountdownTime> = {};
      events.forEach(event => {
        if (event.date) {
          newCountdowns[event.id] = getCountdown(event.date);
        }
      });
      setCountdowns(newCountdowns);
    };

    updateCountdowns();
    const interval = setInterval(updateCountdowns, 1000);
    return () => clearInterval(interval);
  }, [events]);

  const filteredEvents = events.filter(event => {
    const countdown = countdowns[event.id];
    if (filter === 'upcoming') return !countdown?.expired;
    if (filter === 'past') return countdown?.expired;
    return true;
  });

  const upcomingCount = events.filter(e => !countdowns[e.id]?.expired).length;
  const pastCount = events.filter(e => countdowns[e.id]?.expired).length;

  return (
    <div className="space-y-12 animate-fadeIn pb-24 max-w-7xl mx-auto">
      {/* HERO HEADER CON GRADIENTE ANIMADO */}
      <header className="relative text-center space-y-6 overflow-hidden rounded-[3rem] p-8 md:p-12">
        {/* Fondo gradiente animado */}
        <div className="absolute inset-0 bg-gradient-to-br from-purple-600/20 via-[#a3cf33]/10 to-pink-600/20 animate-gradient"></div>
        <div className="absolute inset-0 backdrop-blur-3xl"></div>

        <div className="relative z-10">
          <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-600/30 to-pink-600/30 border border-purple-500/40 rounded-full text-purple-200 text-xs font-black uppercase tracking-[0.3em] backdrop-blur-xl mb-4">
            <i className="fa-solid fa-calendar-star text-lg"></i>
            Cartelera Oficial
          </div>

          <h1 className="text-5xl md:text-7xl font-black text-white uppercase tracking-tighter mb-4">
            Agenda de <span className="bg-gradient-to-r from-[#a3cf33] to-yellow-400 bg-clip-text text-transparent">Eventos</span>
          </h1>

          <p className="text-slate-400 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            ✨ Los mejores tonos y conciertos de la cumbia peruana
          </p>
        </div>
      </header>

      {/* STATS CON EFECTOS GLOW */}
      <div className="grid grid-cols-3 gap-4 max-w-3xl mx-auto">
        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-[#a3cf33]/20 to-yellow-400/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
          <div className="relative text-center p-6 md:p-8 glass-dark rounded-3xl border border-white/10 backdrop-blur-xl">
            <p className="text-4xl md:text-5xl font-black bg-gradient-to-br from-[#a3cf33] to-yellow-400 bg-clip-text text-transparent">{events.length}</p>
            <p className="text-[9px] md:text-xs font-black text-slate-500 uppercase tracking-widest mt-2">Total</p>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
          <div className="relative text-center p-6 md:p-8 glass-dark rounded-3xl border border-white/10 backdrop-blur-xl">
            <p className="text-4xl md:text-5xl font-black bg-gradient-to-br from-green-400 to-emerald-400 bg-clip-text text-transparent">{upcomingCount}</p>
            <p className="text-[9px] md:text-xs font-black text-slate-500 uppercase tracking-widest mt-2">Próximos</p>
          </div>
        </div>

        <div className="relative group">
          <div className="absolute inset-0 bg-gradient-to-br from-slate-600/20 to-slate-700/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all"></div>
          <div className="relative text-center p-6 md:p-8 glass-dark rounded-3xl border border-white/10 backdrop-blur-xl">
            <p className="text-4xl md:text-5xl font-black text-slate-600">{pastCount}</p>
            <p className="text-[9px] md:text-xs font-black text-slate-500 uppercase tracking-widest mt-2">Pasados</p>
          </div>
        </div>
      </div>

      {/* FILTROS MODERNOS */}
      <div className="flex flex-wrap justify-center gap-3">
        {[
          { key: 'upcoming', label: 'Próximos', icon: 'fa-clock', gradient: 'from-green-500 to-emerald-500' },
          { key: 'all', label: 'Todos', icon: 'fa-calendar', gradient: 'from-[#a3cf33] to-yellow-400' },
          { key: 'past', label: 'Pasados', icon: 'fa-history', gradient: 'from-slate-600 to-slate-700' }
        ].map(({ key, label, icon, gradient }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`relative px-6 md:px-8 py-3 md:py-4 rounded-2xl text-xs md:text-sm font-black uppercase tracking-widest flex items-center gap-2 md:gap-3 transition-all overflow-hidden group ${filter === key ? 'scale-110' : 'scale-100 hover:scale-105'
              }`}
          >
            {filter === key && (
              <div className={`absolute inset-0 bg-gradient-to-r ${gradient} opacity-100`}></div>
            )}
            {filter !== key && (
              <div className="absolute inset-0 bg-white/5 group-hover:bg-white/10"></div>
            )}
            <i className={`fa-solid ${icon} relative z-10 ${filter === key ? 'text-black' : 'text-slate-400'}`}></i>
            <span className={`relative z-10 ${filter === key ? 'text-black' : 'text-slate-400'}`}>{label}</span>
          </button>
        ))}
      </div>

      {/* EVENTS GRID MODERNIZADO */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-20 glass-dark rounded-[3rem] border border-white/5 backdrop-blur-xl">
          <i className="fa-solid fa-calendar-xmark text-6xl text-slate-700 mb-6"></i>
          <p className="text-slate-500 text-base font-bold">No hay eventos en esta categoría</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredEvents.map((event, index) => {
            const countdown = countdowns[event.id];
            const isExpired = countdown?.expired;

            return (
              <div
                key={event.id}
                className="group relative"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* Glow effect */}
                {!isExpired && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#a3cf33] via-yellow-400 to-[#a3cf33] rounded-[2.5rem] opacity-0 group-hover:opacity-30 blur-xl transition-all duration-500"></div>
                )}

                <div className={`relative glass-dark rounded-[2rem] overflow-hidden border transition-all duration-500 group-hover:scale-[1.02] ${isExpired ? 'border-white/5 opacity-70' : 'border-[#a3cf33]/30 group-hover:border-[#a3cf33]/60'
                  }`}>
                  {/* IMAGE CON PARALLAX */}
                  <div className="aspect-[4/5] overflow-hidden relative">
                    <img
                      src={event.imageUrl}
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 group-hover:rotate-1"
                      alt={event.title}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent"></div>

                    {/* DATE BADGE CON GRADIENTE */}
                    <div className={`absolute top-4 left-4 px-5 py-2.5 rounded-2xl font-black text-xs uppercase shadow-2xl backdrop-blur-xl ${isExpired
                        ? 'bg-gradient-to-r from-slate-700 to-slate-800 text-slate-300'
                        : 'bg-gradient-to-r from-[#a3cf33] to-yellow-400 text-black'
                      }`}>
                      {event.date ? new Date(event.date).toLocaleDateString('es-PE', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric'
                      }) : 'Próximamente'}
                    </div>

                    {/* COUNTDOWN FLIP-STYLE */}
                    {!isExpired && countdown && (
                      <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-xl rounded-3xl p-5 border border-[#a3cf33]/20">
                        <p className="text-[9px] font-black text-[#a3cf33] uppercase tracking-[0.3em] mb-3 text-center flex items-center justify-center gap-2">
                          <i className="fa-solid fa-hourglass-half animate-pulse"></i>
                          Cuenta Regresiva
                        </p>
                        <div className="grid grid-cols-4 gap-2 md:gap-3">
                          {[
                            { value: countdown.days, label: 'Días' },
                            { value: countdown.hours, label: 'Hrs' },
                            { value: countdown.minutes, label: 'Min' },
                            { value: countdown.seconds, label: 'Seg' }
                          ].map((item, idx) => (
                            <div key={idx} className="relative">
                              <div className="bg-gradient-to-br from-[#a3cf33]/20 to-yellow-400/20 rounded-xl p-2 md:p-3 border border-[#a3cf33]/30">
                                <p className="text-xl md:text-2xl font-black text-white text-center tabular-nums">
                                  {String(item.value).padStart(2, '0')}
                                </p>
                                <p className="text-[7px] md:text-[8px] text-slate-400 uppercase text-center mt-1">{item.label}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* PAST EVENT BADGE */}
                    {isExpired && (
                      <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-xl rounded-3xl p-5 border border-white/10 text-center">
                        <i className="fa-solid fa-check-circle text-2xl text-slate-500 mb-2"></i>
                        <p className="text-slate-400 text-sm font-bold">Evento Finalizado</p>
                      </div>
                    )}
                  </div>

                  {/* INFO */}
                  <div className="p-6 space-y-4">
                    <h3 className="text-white font-black text-lg md:text-xl uppercase leading-tight line-clamp-2 group-hover:text-[#a3cf33] transition-colors">
                      {event.title}
                    </h3>

                    <div className="space-y-2">
                      <div className="flex items-center gap-3 text-slate-400 text-xs md:text-sm">
                        <div className="w-8 h-8 rounded-lg bg-[#3fb4e5]/20 flex items-center justify-center flex-shrink-0">
                          <i className="fa-solid fa-location-dot text-[#3fb4e5]"></i>
                        </div>
                        <span className="truncate">{event.location || 'Por confirmar'}</span>
                      </div>

                      {event.date && (
                        <div className="flex items-center gap-3 text-slate-400 text-xs md:text-sm">
                          <div className="w-8 h-8 rounded-lg bg-orange-400/20 flex items-center justify-center flex-shrink-0">
                            <i className="fa-solid fa-clock text-orange-400"></i>
                          </div>
                          <span>{new Date(event.date).toLocaleTimeString('es-PE', {
                            hour: '2-digit',
                            minute: '2-digit'
                          })} hrs</span>
                        </div>
                      )}
                    </div>

                    {event.description && (
                      <p className="text-slate-400 text-xs md:text-sm line-clamp-2 leading-relaxed">
                        {event.description}
                      </p>
                    )}

                    {/* ACTIONS */}
                    <div className="flex gap-3 pt-2">
                      <button
                        onClick={() => window.open(`${WHATSAPP_URL}?text=Hola! Quiero info de: ${event.title}`, '_blank')}
                        className={`flex-1 py-3 md:py-4 font-black rounded-2xl text-[10px] md:text-xs uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${isExpired
                            ? 'bg-slate-700 text-slate-400'
                            : 'bg-gradient-to-r from-[#25D366] to-[#20bd5a] text-white hover:shadow-lg hover:shadow-green-500/50'
                          }`}
                      >
                        <i className="fa-brands fa-whatsapp text-lg md:text-xl"></i>
                        {isExpired ? 'Consultar' : '¡Quiero ir!'}
                      </button>
                      <button
                        onClick={() => setSelectedEvent(event)}
                        className="w-12 h-12 md:w-14 md:h-14 bg-white/10 text-white rounded-2xl flex items-center justify-center hover:bg-white/20 hover:scale-110 transition-all backdrop-blur-xl"
                      >
                        <i className="fa-solid fa-expand"></i>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL MODERNIZADO */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-50 flex items-center justify-center p-4 animate-fadeIn"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="max-w-3xl w-full glass-dark rounded-[3rem] overflow-hidden border border-white/10 backdrop-blur-3xl animate-scaleIn"
            onClick={e => e.stopPropagation()}
          >
            <div className="aspect-[16/9] md:aspect-[3/4] max-h-[60vh] overflow-hidden relative">
              <img
                src={selectedEvent.imageUrl}
                className="w-full h-full object-cover"
                alt={selectedEvent.title}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>

              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-6 right-6 w-14 h-14 bg-black/50 backdrop-blur-xl text-white rounded-2xl flex items-center justify-center hover:bg-black/70 hover:scale-110 transition-all border border-white/10"
              >
                <i className="fa-solid fa-xmark text-2xl"></i>
              </button>
            </div>

            <div className="p-8 md:p-10 space-y-6">
              <h3 className="text-white font-black text-3xl md:text-4xl uppercase leading-tight">{selectedEvent.title}</h3>

              <div className="flex flex-wrap gap-4 text-sm md:text-base text-slate-400">
                {selectedEvent.date && (
                  <span className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl">
                    <i className="fa-solid fa-calendar text-[#a3cf33]"></i>
                    {new Date(selectedEvent.date).toLocaleDateString('es-PE', {
                      weekday: 'long',
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </span>
                )}
                {selectedEvent.location && (
                  <span className="flex items-center gap-3 px-4 py-2 bg-white/5 rounded-xl">
                    <i className="fa-solid fa-location-dot text-[#3fb4e5]"></i>
                    {selectedEvent.location}
                  </span>
                )}
              </div>

              {selectedEvent.description && (
                <p className="text-slate-300 text-sm md:text-base leading-relaxed bg-white/5 p-6 rounded-2xl border border-white/10">
                  <i className="fa-solid fa-music text-[#a3cf33] mr-2"></i>
                  {selectedEvent.description}
                </p>
              )}

              <button
                onClick={() => window.open(`${WHATSAPP_URL}?text=Hola! Quiero info de: ${selectedEvent.title}`, '_blank')}
                className="w-full py-5 bg-gradient-to-r from-[#25D366] to-[#20bd5a] text-white font-black rounded-2xl text-sm md:text-base uppercase tracking-widest flex items-center justify-center gap-3 hover:shadow-2xl hover:shadow-green-500/50 transition-all active:scale-95"
              >
                <i className="fa-brands fa-whatsapp text-2xl"></i>
                Consultar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventsView;
