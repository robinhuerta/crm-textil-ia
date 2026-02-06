
import React, { useState, useEffect } from 'react';
import { RadioEvent, RadioShort, MusicTrack } from '../types';
import { DEFAULT_HOURLY_SCRIPTS, DEFAULT_JINGLES, MOCK_EVENTS, MOCK_SHORTS, MOCK_TRACKS, RADIO_STREAM_URL, RADIO_STREAM_CUMBIAS, RADIO_STREAM_HUAYNOS } from '../constants';

const SettingsView: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [pass, setPass] = useState('');
  const [tab, setTab] = useState<'events' | 'shorts' | 'music' | 'polls' | 'config' | 'dj'>(() => {
    return (localStorage.getItem('settings_last_tab') as any) || 'events';
  });

  const [events, setEvents] = useState<RadioEvent[]>([]);
  const [shorts, setShorts] = useState<RadioShort[]>([]);
  const [tracks, setTracks] = useState<MusicTrack[]>([]);

  const [newEvent, setNewEvent] = useState({ title: '', date: '', location: '', imageUrl: '' });
  const [newShort, setNewShort] = useState({ title: '', videoUrl: '' });
  const [newTrack, setNewTrack] = useState({ title: '', artist: '', url: '' });

  // Poll state
  const [newPollQuestion, setNewPollQuestion] = useState('');
  const [newPollOptions, setNewPollOptions] = useState(['', '', '']);
  const [newPollDuration, setNewPollDuration] = useState(12);
  const [activePoll, setActivePoll] = useState<any>(null);
  const [pollMessage, setPollMessage] = useState('');

  // Config state
  const [streamMain, setStreamMain] = useState('');
  const [streamCumbias, setStreamCumbias] = useState('');
  const [streamHuaynos, setStreamHuaynos] = useState('');
  const [radioName, setRadioName] = useState('');
  const [whatsappNumber, setWhatsappNumber] = useState('');
  const [youtubeChannel, setYoutubeChannel] = useState('');
  const [configMessage, setConfigMessage] = useState('');

  useEffect(() => {
    setEvents(JSON.parse(localStorage.getItem('radio_events') || JSON.stringify(MOCK_EVENTS)));
    setShorts(JSON.parse(localStorage.getItem('radio_shorts') || JSON.stringify(MOCK_SHORTS)));
    setTracks(JSON.parse(localStorage.getItem('radio_tracks') || JSON.stringify(MOCK_TRACKS)));

    // Load config
    setStreamMain(localStorage.getItem('radio_url_main_config') || RADIO_STREAM_URL);
    setStreamCumbias(localStorage.getItem('radio_url_cumbias_config') || RADIO_STREAM_CUMBIAS);
    setStreamHuaynos(localStorage.getItem('radio_url_huaynos_config') || RADIO_STREAM_HUAYNOS);
    setRadioName(localStorage.getItem('radio_name_config') || 'La Nueva 5:40');
    setWhatsappNumber(localStorage.getItem('radio_whatsapp_config') || '51999999999');
    setYoutubeChannel(localStorage.getItem('radio_youtube_config') || '');

    // Load active poll
    const savedPoll = localStorage.getItem('radio540_polls');
    if (savedPoll) {
      const parsed = JSON.parse(savedPoll);
      if (new Date(parsed.endsAt) > new Date()) {
        setActivePoll(parsed);
      }
    }
    localStorage.removeItem('settings_last_tab');
  }, []);

  const saveConfig = () => {
    localStorage.setItem('radio_url_main_config', streamMain);
    localStorage.setItem('radio_url_cumbias_config', streamCumbias);
    localStorage.setItem('radio_url_huaynos_config', streamHuaynos);
    localStorage.setItem('radio_name_config', radioName);
    localStorage.setItem('radio_whatsapp_config', whatsappNumber);
    localStorage.setItem('radio_youtube_config', youtubeChannel);
    setConfigMessage('✅ Configuración guardada');
    setTimeout(() => setConfigMessage(''), 3000);
    window.dispatchEvent(new Event('radio_config_updated'));
  };

  const resetConfig = () => {
    setStreamMain(RADIO_STREAM_URL);
    setStreamCumbias(RADIO_STREAM_CUMBIAS);
    setStreamHuaynos(RADIO_STREAM_HUAYNOS);
    setRadioName('La Nueva 5:40');
    setWhatsappNumber('51999999999');
    setYoutubeChannel('');
    localStorage.removeItem('radio_url_main_config');
    localStorage.removeItem('radio_url_cumbias_config');
    localStorage.removeItem('radio_url_huaynos_config');
    localStorage.removeItem('radio_name_config');
    localStorage.removeItem('radio_whatsapp_config');
    localStorage.removeItem('radio_youtube_config');
    setConfigMessage('🔄 Configuración restaurada');
    setTimeout(() => setConfigMessage(''), 3000);
  };

  const clearAllData = () => {
    if (confirm('¿Estás seguro? Esto borrará TODOS los datos guardados.')) {
      localStorage.clear();
      setConfigMessage('🗑️ Todos los datos eliminados. Recarga la página.');
      setTimeout(() => window.location.reload(), 2000);
    }
  };

  const saveEvents = (data: RadioEvent[]) => {
    localStorage.setItem('radio_events', JSON.stringify(data));
    setEvents(data);
    window.dispatchEvent(new Event('radio_content_updated'));
  };

  const saveShorts = (data: RadioShort[]) => {
    localStorage.setItem('radio_shorts', JSON.stringify(data));
    setShorts(data);
    window.dispatchEvent(new Event('radio_content_updated'));
  };

  const saveTracks = (data: MusicTrack[]) => {
    localStorage.setItem('radio_tracks', JSON.stringify(data));
    setTracks(data);
    window.dispatchEvent(new Event('radio_content_updated'));
  };

  const addEvent = () => {
    if (!newEvent.title || !newEvent.imageUrl) return;
    const item: RadioEvent = { ...newEvent, id: Date.now().toString() };
    saveEvents([item, ...events]);
    setNewEvent({ title: '', date: '', location: '', imageUrl: '' });
  };

  const addShort = () => {
    if (!newShort.title || !newShort.videoUrl) return;
    const item: RadioShort = {
      ...newShort,
      id: Date.now().toString(),
      thumbnail: `https://img.youtube.com/vi/${newShort.videoUrl.split('v=')[1]?.split('&')[0] || newShort.videoUrl.split('/').pop()}/mqdefault.jpg`
    };
    saveShorts([item, ...shorts]);
    setNewShort({ title: '', videoUrl: '' });
  };

  const addTrack = () => {
    if (!newTrack.title || !newTrack.url) return;
    const item: MusicTrack = { ...newTrack, id: Date.now().toString() };
    saveTracks([item, ...tracks]);
    setNewTrack({ title: '', artist: '', url: '' });
  };

  const deleteItem = (id: string, type: 'event' | 'short' | 'track' | 'poll') => {
    if (type === 'event') saveEvents(events.filter(e => e.id !== id));
    else if (type === 'short') saveShorts(shorts.filter(s => s.id !== id));
    else if (type === 'track') saveTracks(tracks.filter(t => t.id !== id));
    else if (type === 'poll') {
      localStorage.removeItem('radio540_polls');
      setActivePoll(null);
      setPollMessage('✅ Encuesta eliminada');
      setTimeout(() => setPollMessage(''), 3000);
    }
  };

  // Stats
  const totalContent = events.length + shorts.length + tracks.length;

  if (!isAdmin) {
    return (
      <div className="max-w-md mx-auto mt-20 glass p-10 rounded-[3rem] text-center border border-white/10 shadow-2xl">
        <h2 className="text-2xl font-black text-white uppercase mb-8 tracking-tighter">Plan Maestro <span className="text-[#a3cf33]">5:40</span></h2>
        <input
          type="password"
          placeholder="Clave de Cabina"
          className="w-full bg-black/50 border border-white/10 rounded-2xl px-6 py-4 text-center text-white mb-4 outline-none focus:border-[#a3cf33] transition-all"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && pass === 'radio540' && setIsAdmin(true)}
        />
        <button
          onClick={() => pass === 'radio540' && setIsAdmin(true)}
          className="w-full py-4 bg-[#a3cf33] text-slate-900 font-black rounded-2xl uppercase shadow-lg active:scale-95 transition-all"
        >
          Entrar a Cabina
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fadeIn max-w-5xl mx-auto pb-20 px-4">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Panel de <span className="text-[#a3cf33]">Control</span></h2>
          <p className="text-slate-500 text-[9px] uppercase tracking-widest mt-1">{totalContent} elementos cargados</p>
        </div>
        <nav className="flex flex-wrap gap-2 p-1.5 bg-slate-950/80 rounded-2xl border border-white/5">
          {['events', 'shorts', 'music', 'polls', 'config', 'dj'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              className={`py-2.5 px-5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${tab === t ? 'bg-[#a3cf33] text-slate-900' : 'text-slate-500 hover:text-white'}`}
            >
              {t === 'events' ? '📅 Flyers' : t === 'shorts' ? '🎬 Video' : t === 'music' ? '🎵 Música' : t === 'polls' ? '🗳️ Votación' : t === 'config' ? '⚙️ Config' : '🤖 DJ AI'}
            </button>
          ))}
        </nav>
      </div>

      <div className="glass-dark p-8 md:p-12 rounded-[3.5rem] border border-white/5">

        {/* CONFIG TAB */}
        {tab === 'config' && (
          <div className="space-y-10">
            {configMessage && (
              <div className="p-4 bg-[#a3cf33]/20 border border-[#a3cf33]/40 rounded-2xl text-white font-bold text-center">
                {configMessage}
              </div>
            )}

            {/* STREAMS */}
            <section className="space-y-6">
              <h3 className="text-purple-400 font-black text-xs uppercase tracking-[0.3em] flex items-center gap-2">
                <i className="fa-solid fa-tower-broadcast"></i> Señales de Radio (Streams)
              </h3>
              <div className="space-y-4">
                <Input label="📻 Stream Principal" value={streamMain} onChange={setStreamMain} placeholder="https://stream.ejemplo.com/radio" />
                <Input label="🎺 Stream Cumbias" value={streamCumbias} onChange={setStreamCumbias} placeholder="https://stream.ejemplo.com/cumbias" />
                <Input label="🎻 Stream Huaynos" value={streamHuaynos} onChange={setStreamHuaynos} placeholder="https://stream.ejemplo.com/huaynos" />
              </div>
            </section>

            {/* SOCIAL */}
            <section className="space-y-6 pt-8 border-t border-white/5">
              <h3 className="text-green-400 font-black text-xs uppercase tracking-[0.3em] flex items-center gap-2">
                <i className="fa-solid fa-share-nodes"></i> Redes y Contacto
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="📝 Nombre de la Radio" value={radioName} onChange={setRadioName} placeholder="La Nueva 5:40" />
                <Input label="📱 WhatsApp (sin +)" value={whatsappNumber} onChange={setWhatsappNumber} placeholder="51999999999" />
                <div className="md:col-span-2">
                  <Input label="🎬 Canal de YouTube" value={youtubeChannel} onChange={setYoutubeChannel} placeholder="https://youtube.com/@tucanal" />
                </div>
              </div>
            </section>

            {/* STATS */}
            <section className="space-y-6 pt-8 border-t border-white/5">
              <h3 className="text-blue-400 font-black text-xs uppercase tracking-[0.3em] flex items-center gap-2">
                <i className="fa-solid fa-chart-simple"></i> Estadísticas
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatCard icon="fa-calendar" value={events.length} label="Eventos" color="#a3cf33" />
                <StatCard icon="fa-video" value={shorts.length} label="Videos" color="#3fb4e5" />
                <StatCard icon="fa-music" value={tracks.length} label="Canciones" color="#E040FB" />
                <StatCard icon="fa-check-to-slot" value={activePoll ? 1 : 0} label="Encuestas" color="#FF5252" />
              </div>
            </section>

            {/* ACTIONS */}
            <section className="space-y-4 pt-8 border-t border-white/5">
              <h3 className="text-orange-400 font-black text-xs uppercase tracking-[0.3em] flex items-center gap-2">
                <i className="fa-solid fa-wrench"></i> Acciones
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button onClick={saveConfig} className="py-4 bg-[#a3cf33] text-slate-900 font-black rounded-2xl uppercase text-[10px] tracking-widest">
                  💾 Guardar Cambios
                </button>
                <button onClick={resetConfig} className="py-4 bg-slate-700 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest">
                  🔄 Restaurar Defaults
                </button>
                <button onClick={clearAllData} className="py-4 bg-red-600 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest">
                  🗑️ Borrar Todo
                </button>
              </div>
            </section>

            {/* APP INFO */}
            <section className="pt-8 border-t border-white/5 text-center">
              <p className="text-slate-600 text-[8px] font-black uppercase tracking-[0.5em]">
                Radio 5:40 App v2.0 • Hecho con ❤️ en Perú
              </p>
            </section>
          </div>
        )}

        {tab === 'music' && (
          <div className="space-y-12">
            <section className="space-y-6">
              <h3 className="text-blue-400 font-black text-xs uppercase tracking-[0.3em]">Cargar Nueva Canción MP3</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Título de Canción" value={newTrack.title} onChange={(v) => setNewTrack({ ...newTrack, title: v })} placeholder="Ej: Mix Cumbias 2025" />
                <Input label="Artista / Orquesta" value={newTrack.artist} onChange={(v) => setNewTrack({ ...newTrack, artist: v })} placeholder="Ej: Grupo 5" />
                <div className="md:col-span-2">
                  <Input label="Link Directo del MP3 (.mp3)" value={newTrack.url} onChange={(v) => setNewTrack({ ...newTrack, url: v })} placeholder="https://ejemplo.com/musica.mp3" />
                </div>
              </div>
              <button onClick={addTrack} className="w-full py-4 bg-blue-500 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl transition-all">Guardar en Biblioteca</button>
            </section>

            <section className="space-y-6 pt-10 border-t border-white/5">
              <h3 className="text-white font-black text-xs uppercase tracking-[0.3em]">Temas Cargados ({tracks.length})</h3>
              <div className="grid grid-cols-1 gap-3">
                {tracks.map((t) => (
                  <div key={t.id} className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
                    <div>
                      <p className="text-white text-xs font-black uppercase">{t.title}</p>
                      <p className="text-slate-500 text-[9px] uppercase">{t.artist}</p>
                    </div>
                    <button onClick={() => deleteItem(t.id, 'track')} className="w-8 h-8 bg-red-600/20 text-red-500 rounded-full flex items-center justify-center hover:bg-red-600 hover:text-white transition-all">
                      <i className="fa-solid fa-trash text-xs"></i>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === 'events' && (
          <div className="space-y-12">
            <section className="space-y-6">
              <h3 className="text-[#a3cf33] font-black text-xs uppercase tracking-[0.3em]">Añadir Nuevo Flyer</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="Nombre del Evento" value={newEvent.title} onChange={(v) => setNewEvent({ ...newEvent, title: v })} placeholder="Ej: Aniversario 5:40" />
                <Input label="Link del Flyer (Imagen)" value={newEvent.imageUrl} onChange={(v) => setNewEvent({ ...newEvent, imageUrl: v })} placeholder="https://..." />
                <Input label="Fecha y Hora" type="datetime-local" value={newEvent.date} onChange={(v) => setNewEvent({ ...newEvent, date: v })} />
                <Input label="Local / Ubicación" value={newEvent.location} onChange={(v) => setNewEvent({ ...newEvent, location: v })} placeholder="Ej: El Huaralino" />
              </div>
              <button onClick={addEvent} className="w-full py-4 bg-[#a3cf33] text-slate-900 font-black rounded-2xl uppercase text-[10px] tracking-widest transition-all">Publicar Flyer</button>
            </section>

            <section className="space-y-6 pt-10 border-t border-white/5">
              <h3 className="text-white font-black text-xs uppercase tracking-[0.3em]">Agenda Actual ({events.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {events.map((e) => (
                  <div key={e.id} className="relative group rounded-2xl overflow-hidden aspect-[3/4] border border-white/10 bg-black">
                    <img src={e.imageUrl} className="w-full h-full object-cover opacity-60" alt="" />
                    <div className="absolute inset-0 p-4 flex flex-col justify-end">
                      <p className="text-white text-[9px] font-black uppercase line-clamp-1">{e.title}</p>
                    </div>
                    <button onClick={() => deleteItem(e.id, 'event')} className="absolute top-2 right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all">
                      <i className="fa-solid fa-trash text-xs"></i>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === 'shorts' && (
          <div className="space-y-12">
            <section className="space-y-6">
              <h3 className="text-[#3fb4e5] font-black text-xs uppercase tracking-[0.3em]">Subir Publicidad (Video)</h3>
              <div className="grid grid-cols-1 gap-4">
                <Input label="Título de la Publicidad" value={newShort.title} onChange={(v) => setNewShort({ ...newShort, title: v })} placeholder="Ej: Gran Tono este Sábado" />
                <Input label="Link de YouTube (Short o Video)" value={newShort.videoUrl} onChange={(v) => setNewShort({ ...newShort, videoUrl: v })} placeholder="https://www.youtube.com/watch?v=..." />
              </div>
              <button onClick={addShort} className="w-full py-4 bg-[#3fb4e5] text-white font-black rounded-2xl uppercase text-[10px] tracking-widest transition-all">Subir Video</button>
            </section>

            <section className="space-y-6 pt-10 border-t border-white/5">
              <h3 className="text-white font-black text-xs uppercase tracking-[0.3em]">Publicidad Activa ({shorts.length})</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {shorts.map((s) => (
                  <div key={s.id} className="relative group rounded-2xl overflow-hidden aspect-video border border-white/10 bg-black">
                    <img src={s.thumbnail} className="w-full h-full object-cover opacity-50" alt="" />
                    <div className="absolute inset-0 p-4 flex flex-col justify-end">
                      <p className="text-white text-[9px] font-black uppercase truncate">{s.title}</p>
                    </div>
                    <button onClick={() => deleteItem(s.id, 'short')} className="absolute top-2 right-2 w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all">
                      <i className="fa-solid fa-trash text-xs"></i>
                    </button>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {tab === 'dj' && (
          <div className="space-y-10">
            <header className="space-y-4 text-center md:text-left">
              <h3 className="text-white font-black text-xl uppercase">🤖 Personalización del DJ AI</h3>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest leading-relaxed max-w-2xl">
                El DJ usa Gemini 2.5 Flash para dar la hora cada 30 min y soltar cuñas cada 20 min. Toda la locución es en tiempo real con acento peruano.
              </p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('trigger_jingle_manual'))}
                className="py-5 bg-orange-600 text-white font-black rounded-2xl uppercase text-[11px] tracking-[0.2em] shadow-2xl transition-all hover:bg-orange-500"
              >
                🎙️ Probar Voz del DJ
              </button>
              <button
                onClick={() => window.dispatchEvent(new CustomEvent('radio_playback_control', { detail: { action: 'play' } }))}
                className="py-5 bg-green-600 text-white font-black rounded-2xl uppercase text-[11px] tracking-[0.2em] shadow-2xl transition-all hover:bg-green-500"
              >
                ▶️ Iniciar Radio
              </button>
            </div>

            <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
              <h4 className="text-[#a3cf33] font-black text-xs uppercase tracking-widest mb-4">Funciones del DJ AI:</h4>
              <ul className="space-y-2 text-slate-400 text-xs">
                <li>⏰ Dice la hora cada 30 minutos</li>
                <li>🎵 Suelta cuñas musicales cada 20 minutos</li>
                <li>🗣️ Responde preguntas por voz</li>
                <li>⭐ Da horóscopos divertidos</li>
                <li>🔥 Cuenta chismes de farándula</li>
                <li>💖 Manda saludos románticos</li>
                <li>🔊 Controla el volumen (baja al hablar)</li>
              </ul>
            </div>
          </div>
        )}

        {tab === 'polls' && (
          <div className="space-y-10">
            {pollMessage && (
              <div className="p-4 bg-[#a3cf33]/20 border border-[#a3cf33]/40 rounded-2xl text-white font-bold text-center">
                {pollMessage}
              </div>
            )}

            <section className="space-y-6">
              <h3 className="text-orange-400 font-black text-xs uppercase tracking-[0.3em]">Crear Nueva Encuesta</h3>
              <div className="space-y-4">
                <Input
                  label="Pregunta de la Encuesta"
                  value={newPollQuestion}
                  onChange={(v: string) => setNewPollQuestion(v)}
                  placeholder="¿Qué género quieres escuchar?"
                />
                <div>
                  <label className="text-slate-500 text-[9px] font-black uppercase tracking-widest ml-4 block mb-2">Opciones:</label>
                  {newPollOptions.map((opt, idx) => (
                    <input
                      key={idx}
                      type="text"
                      value={opt}
                      onChange={(e) => {
                        const updated = [...newPollOptions];
                        updated[idx] = e.target.value;
                        setNewPollOptions(updated);
                      }}
                      placeholder={`Opción ${idx + 1}`}
                      className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white text-xs outline-none focus:border-[#a3cf33] transition-all mb-2"
                    />
                  ))}
                  <button
                    onClick={() => setNewPollOptions([...newPollOptions, ''])}
                    className="text-xs text-[#a3cf33] hover:underline ml-4"
                  >
                    + Agregar opción
                  </button>
                </div>
                <div className="flex items-center gap-4">
                  <label className="text-slate-500 text-[9px] font-black uppercase tracking-widest">Duración (horas):</label>
                  <input
                    type="number"
                    value={newPollDuration}
                    onChange={(e) => setNewPollDuration(Number(e.target.value))}
                    min={1}
                    max={48}
                    className="w-24 bg-slate-900 border border-white/10 rounded-xl px-4 py-2 text-white text-sm"
                  />
                </div>
              </div>
              <button
                onClick={() => {
                  const question = newPollQuestion.trim();
                  const validOptions = newPollOptions.filter(o => o.trim());
                  if (!question) { setPollMessage('❌ Escribe una pregunta'); return; }
                  if (validOptions.length < 2) { setPollMessage('❌ Necesitas al menos 2 opciones'); return; }
                  const endsAt = new Date();
                  endsAt.setHours(endsAt.getHours() + newPollDuration);
                  const votes: Record<string, number> = {};
                  validOptions.forEach(opt => votes[opt.trim()] = 0);
                  const newPoll = {
                    id: Date.now().toString(),
                    question,
                    options: validOptions.map(o => o.trim()),
                    votes,
                    endsAt: endsAt.toISOString(),
                    createdAt: new Date().toISOString()
                  };
                  localStorage.setItem('radio540_polls', JSON.stringify(newPoll));
                  setActivePoll(newPoll);
                  setNewPollQuestion('');
                  setNewPollOptions(['', '', '']);
                  setPollMessage('✅ ¡Encuesta creada!');
                  setTimeout(() => setPollMessage(''), 3000);
                }}
                className="w-full py-4 bg-orange-500 text-white font-black rounded-2xl uppercase text-[10px] tracking-widest shadow-xl transition-all active:scale-95"
              >
                🚀 Crear Encuesta
              </button>
            </section>

            {activePoll && (
              <section className="space-y-6 pt-10 border-t border-white/5">
                <h3 className="text-white font-black text-xs uppercase tracking-[0.3em]">Encuesta Activa</h3>
                <div className="p-6 bg-white/5 rounded-2xl border border-white/10">
                  <p className="text-white font-black text-lg mb-4">{activePoll.question}</p>
                  <div className="space-y-2 mb-4">
                    {activePoll.options.map((opt: string) => (
                      <div key={opt} className="flex justify-between items-center p-3 bg-black/30 rounded-xl">
                        <span className="text-white text-sm">{opt}</span>
                        <span className="text-[#a3cf33] font-bold">{activePoll.votes[opt] || 0} votos</span>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Termina: {new Date(activePoll.endsAt).toLocaleString()}</span>
                    <button
                      onClick={() => deleteItem(activePoll.id, 'poll')}
                      className="px-4 py-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600 hover:text-white transition-all"
                    >
                      Eliminar Encuesta
                    </button>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

const Input = ({ label, value, onChange, placeholder, type = "text" }: any) => (
  <div className="space-y-2">
    <label className="text-slate-500 text-[9px] font-black uppercase tracking-widest ml-4">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full bg-slate-900 border border-white/10 rounded-2xl px-6 py-4 text-white text-xs outline-none focus:border-[#a3cf33] transition-all"
    />
  </div>
);

const StatCard = ({ icon, value, label, color }: any) => (
  <div className="p-4 bg-white/5 rounded-2xl border border-white/5 text-center">
    <i className={`fa-solid ${icon} text-2xl mb-2`} style={{ color }}></i>
    <p className="text-2xl font-black text-white">{value}</p>
    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{label}</p>
  </div>
);

export default SettingsView;
