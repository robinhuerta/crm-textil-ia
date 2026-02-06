
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

  // Update countdowns every second
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

  // Filter events
  const filteredEvents = events.filter(event => {
    const countdown = countdowns[event.id];
    if (filter === 'upcoming') return !countdown?.expired;
    if (filter === 'past') return countdown?.expired;
    return true;
  });

  const upcomingCount = events.filter(e => !countdowns[e.id]?.expired).length;
  const pastCount = events.filter(e => countdowns[e.id]?.expired).length;

  return (
    <div className="space-y-8 animate-fadeIn pb-24 max-w-6xl mx-auto">
      {/* HEADER */}
      <header className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-600/20 border border-purple-500/30 text-purple-300 rounded-full text-[10px] font-black uppercase tracking-[0.2em]">
          <i className="fa-solid fa-calendar-star"></i>
          CARTELERA OFICIAL
        </div>
        <h2 className="text-4xl md:text-6xl font-black text-white uppercase tracking-tighter">
          Agenda de <span className="text-[#a3cf33]">Eventos</span>
        </h2>
        <p className="text-slate-500 text-sm max-w-xl mx-auto">
          Los mejores tonos y conciertos de la cumbia peruana. ¡No te los pierdas!
        </p>
      </header>

      {/* STATS */}
      <div className="grid grid-cols-3 gap-4 max-w-md mx-auto">
        <div className="text-center p-4 glass-dark rounded-2xl border border-white/5">
          <p className="text-3xl font-black text-[#a3cf33]">{events.length}</p>
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Total</p>
        </div>
        <div className="text-center p-4 glass-dark rounded-2xl border border-white/5">
          <p className="text-3xl font-black text-green-400">{upcomingCount}</p>
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Próximos</p>
        </div>
        <div className="text-center p-4 glass-dark rounded-2xl border border-white/5">
          <p className="text-3xl font-black text-slate-600">{pastCount}</p>
          <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">Pasados</p>
        </div>
      </div>

      {/* FILTERS */}
      <div className="flex justify-center gap-2">
        {[
          { key: 'upcoming', label: 'Próximos', icon: 'fa-clock' },
          { key: 'all', label: 'Todos', icon: 'fa-calendar' },
          { key: 'past', label: 'Pasados', icon: 'fa-history' }
        ].map(({ key, label, icon }) => (
          <button
            key={key}
            onClick={() => setFilter(key as any)}
            className={`px-6 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 transition-all ${filter === key
              ? 'bg-[#a3cf33] text-black'
              : 'bg-white/5 text-slate-400 hover:bg-white/10'
              }`}
          >
            <i className={`fa-solid ${icon}`}></i>
            {label}
          </button>
        ))}
      </div>

      {/* EVENTS GRID */}
      {filteredEvents.length === 0 ? (
        <div className="text-center py-20 glass-dark rounded-[3rem] border border-white/5">
          <i className="fa-solid fa-calendar-xmark text-5xl text-slate-700 mb-4"></i>
          <p className="text-slate-500 text-sm font-bold">No hay eventos en esta categoría</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.map((event, index) => {
            const countdown = countdowns[event.id];
            const isExpired = countdown?.expired;

            return (
              <div
                key={event.id}
                className={`glass-dark rounded-[2rem] overflow-hidden border transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl ${isExpired ? 'border-white/5 opacity-60' : 'border-[#a3cf33]/20 hover:border-[#a3cf33]/50'
                  }`}
                style={{ animationDelay: `${index * 100}ms` }}
              >
                {/* IMAGE */}
                <div className="aspect-[4/5] overflow-hidden relative group">
                  <img
                    src={event.imageUrl}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    alt={event.title}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent"></div>

                  {/* DATE BADGE */}
                  <div className={`absolute top-4 left-4 px-4 py-2 rounded-xl font-black text-[11px] uppercase shadow-lg ${isExpired ? 'bg-slate-700 text-slate-300' : 'bg-[#a3cf33] text-black'
                    }`}>
                    {event.date ? new Date(event.date).toLocaleDateString('es-PE', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    }) : 'Próximamente'}
                  </div>

                  {/* COUNTDOWN */}
                  {!isExpired && countdown && (
                    <div className="absolute bottom-4 left-4 right-4 bg-black/80 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                      <p className="text-[8px] font-black text-[#a3cf33] uppercase tracking-[0.3em] mb-2 text-center">
                        ⏳ Cuenta Regresiva
                      </p>
                      <div className="grid grid-cols-4 gap-2 text-center">
                        <div>
                          <p className="text-xl font-black text-white">{countdown.days}</p>
                          <p className="text-[7px] text-slate-500 uppercase">Días</p>
                        </div>
                        <div>
                          <p className="text-xl font-black text-white">{String(countdown.hours).padStart(2, '0')}</p>
                          <p className="text-[7px] text-slate-500 uppercase">Hrs</p>
                        </div>
                        <div>
                          <p className="text-xl font-black text-white">{String(countdown.minutes).padStart(2, '0')}</p>
                          <p className="text-[7px] text-slate-500 uppercase">Min</p>
                        </div>
                        <div>
                          <p className="text-xl font-black text-white animate-pulse">{String(countdown.seconds).padStart(2, '0')}</p>
                          <p className="text-[7px] text-slate-500 uppercase">Seg</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PAST EVENT BADGE */}
                  {isExpired && (
                    <div className="absolute bottom-4 left-4 right-4 bg-slate-900/90 backdrop-blur-sm rounded-2xl p-4 border border-white/10 text-center">
                      <p className="text-slate-400 text-xs font-bold">✓ Evento Finalizado</p>
                    </div>
                  )}
                </div>

                {/* INFO */}
                <div className="p-6 space-y-4">
                  <h3 className="text-white font-black text-lg uppercase leading-tight line-clamp-2">
                    {event.title}
                  </h3>

                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <i className="fa-solid fa-location-dot text-[#3fb4e5]"></i>
                    <span className="truncate">{event.location || 'Por confirmar'}</span>
                  </div>

                  {event.date && (
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                      <i className="fa-solid fa-clock text-orange-400"></i>
                      <span>{new Date(event.date).toLocaleTimeString('es-PE', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })} hrs</span>
                    </div>
                  )}

                  {/* ACTIONS */}
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => window.open(`${WHATSAPP_URL}?text=Hola! Quiero info de: ${event.title}`, '_blank')}
                      className={`flex-1 py-3 font-black rounded-xl text-[10px] uppercase tracking-widest transition-all active:scale-95 flex items-center justify-center gap-2 ${isExpired
                        ? 'bg-slate-700 text-slate-400'
                        : 'bg-[#25D366] text-white hover:bg-[#20bd5a]'
                        }`}
                    >
                      <i className="fa-brands fa-whatsapp text-lg"></i>
                      {isExpired ? 'Consultar' : '¡Quiero ir!'}
                    </button>
                    <button
                      onClick={() => setSelectedEvent(event)}
                      className="w-12 h-12 bg-white/10 text-white rounded-xl flex items-center justify-center hover:bg-white/20 transition-all"
                    >
                      <i className="fa-solid fa-expand"></i>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* MODAL */}
      {selectedEvent && (
        <div
          className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedEvent(null)}
        >
          <div
            className="max-w-2xl w-full glass-dark rounded-[3rem] overflow-hidden border border-white/10"
            onClick={e => e.stopPropagation()}
          >
            <div className="aspect-[3/4] max-h-[60vh] overflow-hidden relative">
              <img
                src={selectedEvent.imageUrl}
                className="w-full h-full object-cover"
                alt={selectedEvent.title}
              />
              <button
                onClick={() => setSelectedEvent(null)}
                className="absolute top-4 right-4 w-12 h-12 bg-black/50 backdrop-blur-sm text-white rounded-full flex items-center justify-center hover:bg-black/70 transition-all"
              >
                <i className="fa-solid fa-xmark text-xl"></i>
              </button>
            </div>
            <div className="p-8 space-y-4">
              <h3 className="text-white font-black text-2xl uppercase">{selectedEvent.title}</h3>
              <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                {selectedEvent.date && (
                  <span className="flex items-center gap-2">
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
                  <span className="flex items-center gap-2">
                    <i className="fa-solid fa-location-dot text-[#3fb4e5]"></i>
                    {selectedEvent.location}
                  </span>
                )}
              </div>
              <button
                onClick={() => window.open(`${WHATSAPP_URL}?text=Hola! Quiero info de: ${selectedEvent.title}`, '_blank')}
                className="w-full py-4 bg-[#25D366] text-white font-black rounded-2xl text-sm uppercase tracking-widest flex items-center justify-center gap-2"
              >
                <i className="fa-brands fa-whatsapp text-xl"></i>
                Consultar por WhatsApp
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="text-center pt-8 space-y-4">
        <div className="w-20 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent mx-auto"></div>
        <p className="text-slate-600 text-[8px] font-black uppercase tracking-[0.5em]">
          Agenda La Nueva 5:40
        </p>
      </div>
    </div>
  );
};

export default EventsView;
