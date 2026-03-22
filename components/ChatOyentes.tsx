import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChatMessage, getChatHistory, sendChatMessage, subscribeToChatMessages } from '../services/supabase';

const NICKNAME_KEY = 'radio_chat_nickname';

const formatTime = (iso: string) => {
  const d = new Date(iso);
  return d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
};

const AVATAR_COLORS = [
  '#2196F3', '#E91E63', '#4CAF50', '#FF9800',
  '#9C27B0', '#00BCD4', '#FF5722', '#607D8B',
];
const getAvatarColor = (nickname: string) => {
  let hash = 0;
  for (let i = 0; i < nickname.length; i++) hash = nickname.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
};

// Agrupar mensajes consecutivos del mismo autor
const groupMessages = (msgs: ChatMessage[]) => {
  const groups: { author: string; color: string; msgs: ChatMessage[] }[] = [];
  msgs.forEach(msg => {
    const last = groups[groups.length - 1];
    if (last && last.author === msg.nickname) {
      last.msgs.push(msg);
    } else {
      groups.push({ author: msg.nickname, color: getAvatarColor(msg.nickname), msgs: [msg] });
    }
  });
  return groups;
};

const ChatOyentes: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [nickname, setNickname] = useState('');
  const [nickDraft, setNickDraft] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [chatHeight, setChatHeight] = useState('calc(100dvh - 11rem)');
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Ajustar altura al teclado en móvil usando visualViewport
  useEffect(() => {
    const updateHeight = () => {
      const vp = window.visualViewport;
      if (!vp) return;
      const isDesktop = window.innerWidth >= 1024;
      const topOffset = isDesktop ? 0 : 90;    // header móvil
      const bottomOffset = isDesktop ? 176 : 132; // nav + player
      setChatHeight(`${Math.max(200, vp.height - topOffset - bottomOffset)}px`);
    };
    window.visualViewport?.addEventListener('resize', updateHeight);
    window.visualViewport?.addEventListener('scroll', updateHeight);
    updateHeight();
    return () => {
      window.visualViewport?.removeEventListener('resize', updateHeight);
      window.visualViewport?.removeEventListener('scroll', updateHeight);
    };
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem(NICKNAME_KEY);
    if (saved) setNickname(saved);
  }, []);

  useEffect(() => {
    if (!nickname) return;
    setLoading(true);
    getChatHistory(80).then(history => {
      setMessages(history);
      setLoading(false);
    });

    const unsub = subscribeToChatMessages((msg) => {
      setMessages(prev => {
        // Si ya existe el ID real, ignorar
        if (prev.some(m => m.id === msg.id)) return prev;
        // Reemplazar el mensaje temporal del mismo autor+texto si existe
        const tempIdx = prev.findIndex(
          m => m.id.startsWith('temp_') && m.nickname === msg.nickname && m.message === msg.message
        );
        if (tempIdx !== -1) {
          const updated = [...prev];
          updated[tempIdx] = msg;
          return updated;
        }
        return [...prev, msg];
      });
    });
    return unsub;
  }, [nickname]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSetNickname = () => {
    const clean = nickDraft.trim().slice(0, 20);
    if (!clean) return;
    localStorage.setItem(NICKNAME_KEY, clean);
    setNickname(clean);
  };

  const handleSend = useCallback(async () => {
    const text = input.trim();
    if (!text || sending || !nickname) return;
    setSending(true);
    setInput('');

    // Mostrar el mensaje inmediatamente (optimistic update)
    const tempMsg: ChatMessage = {
      id: `temp_${Date.now()}`,
      nickname,
      message: text,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, tempMsg]);

    const ok = await sendChatMessage(nickname, text);
    setSending(false);
    if (!ok) {
      // Si falla, quitar el mensaje temporal y restaurar el input
      setMessages(prev => prev.filter(m => m.id !== tempMsg.id));
      setInput(text);
    } else {
      inputRef.current?.focus();
    }
  }, [input, sending, nickname]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  // --- PANTALLA: Elegir apodo (estilo Telegram) ---
  if (!nickname) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-6">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shadow-2xl"
          style={{ background: 'linear-gradient(135deg, #2AABEE 0%, #229ED9 100%)' }}
        >
          <i className="fa-brands fa-telegram text-5xl text-white"></i>
        </div>
        <h2 className="text-white font-black text-2xl mb-1">Chat de Oyentes</h2>
        <p className="text-slate-400 text-sm text-center mb-8 max-w-xs">
          Chatea en tiempo real con la comunidad de La Nueva 5:40
        </p>

        <div className="w-full max-w-sm space-y-4">
          <div className="space-y-1">
            <label className="text-xs text-[#2AABEE] font-semibold pl-1">Tu apodo</label>
            <input
              className="w-full bg-transparent border-b-2 border-white/20 focus:border-[#2AABEE] px-1 py-2 text-white placeholder-slate-600 focus:outline-none transition-colors text-base"
              placeholder="Ej: JuanRocks, MariaLima..."
              value={nickDraft}
              onChange={e => setNickDraft(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSetNickname()}
              maxLength={20}
              autoFocus
            />
          </div>
          <button
            onClick={handleSetNickname}
            disabled={!nickDraft.trim()}
            className="w-full py-3 rounded-full font-bold text-sm uppercase tracking-wider transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-lg"
            style={{ background: 'linear-gradient(135deg, #2AABEE 0%, #229ED9 100%)', color: '#fff' }}
          >
            Entrar al Chat
          </button>
        </div>
      </div>
    );
  }

  const groups = groupMessages(messages);

  // --- PANTALLA: Chat estilo Telegram ---
  return (
    <div className="flex flex-col max-w-2xl mx-auto" style={{ height: chatHeight }}>

      {/* Header estilo Telegram */}
      <div
        className="flex items-center justify-between px-4 py-3 rounded-2xl mb-3 shadow-lg"
        style={{ background: 'linear-gradient(135deg, #1c2a3a 0%, #17212b 100%)', border: '1px solid rgba(42,171,238,0.15)' }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center shadow"
            style={{ background: 'linear-gradient(135deg, #2AABEE 0%, #229ED9 100%)' }}
          >
            <i className="fa-solid fa-radio text-white text-sm"></i>
          </div>
          <div>
            <p className="text-white font-bold text-sm leading-none">La Nueva 5:40</p>
            <p className="text-[#2AABEE] text-[11px] mt-0.5">Chat de oyentes</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            <span className="text-[10px] text-slate-400">En vivo</span>
          </div>
          <button
            onClick={() => { localStorage.removeItem(NICKNAME_KEY); setNickname(''); setNickDraft(''); setMessages([]); }}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
            title="Cambiar apodo"
          >
            <i className="fa-solid fa-user-pen text-sm"></i>
          </button>
        </div>
      </div>

      {/* Área de mensajes */}
      <div
        className="flex-1 overflow-y-auto no-scrollbar px-2 py-3 space-y-1 rounded-2xl"
        style={{ background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.015\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E"), #0e1621' }}
      >
        {loading && (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 border-2 border-[#2AABEE] border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}

        {!loading && messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-3">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center">
              <i className="fa-regular fa-comments text-2xl"></i>
            </div>
            <p className="text-sm">No hay mensajes aún. ¡Sé el primero!</p>
          </div>
        )}

        {groups.map((group, gi) => {
          const isMe = group.author === nickname;
          return (
            <div key={gi} className={`flex gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'} items-end`}>
              {/* Avatar (solo para otros) */}
              {!isMe && (
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-xs flex-shrink-0 mb-1 shadow"
                  style={{ backgroundColor: group.color }}
                >
                  {group.author.charAt(0).toUpperCase()}
                </div>
              )}

              <div className={`flex flex-col gap-0.5 max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                {/* Nombre (solo para otros, solo en primer mensaje del grupo) */}
                {!isMe && (
                  <span className="text-[11px] font-semibold pl-3 mb-0.5" style={{ color: group.color }}>
                    {group.author}
                  </span>
                )}

                {group.msgs.map((msg, mi) => {
                  const isFirst = mi === 0;
                  const isLast = mi === group.msgs.length - 1;
                  return (
                    <div
                      key={msg.id}
                      className={`px-3 py-2 text-sm leading-relaxed break-words relative ${
                        isMe
                          ? `text-white ${isFirst ? 'rounded-tl-2xl' : 'rounded-l-2xl'} ${isLast ? 'rounded-br-sm' : ''} rounded-tr-2xl rounded-bl-2xl`
                          : `text-slate-100 ${isFirst ? 'rounded-tr-2xl' : 'rounded-r-2xl'} ${isLast ? 'rounded-bl-sm' : ''} rounded-tl-2xl rounded-br-2xl`
                      }`}
                      style={{
                        backgroundColor: isMe ? '#2B5278' : '#182533',
                        border: isMe ? '1px solid rgba(42,171,238,0.2)' : '1px solid rgba(255,255,255,0.05)',
                      }}
                    >
                      {msg.message}
                      {/* Timestamp en último mensaje del grupo */}
                      {isLast && (
                        <span
                          className="text-[10px] ml-2 float-right mt-1 select-none"
                          style={{ color: isMe ? 'rgba(255,255,255,0.45)' : 'rgba(255,255,255,0.3)' }}
                        >
                          {formatTime(msg.created_at)}
                          {isMe && <i className="fa-solid fa-check-double ml-1" style={{ color: '#2AABEE' }}></i>}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Input estilo Telegram */}
      <div className="pt-3">
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-full shadow-lg"
          style={{ backgroundColor: '#17212b', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div
            className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 font-black text-xs text-white shadow"
            style={{ backgroundColor: getAvatarColor(nickname) }}
          >
            {nickname.charAt(0).toUpperCase()}
          </div>
          <input
            ref={inputRef}
            className="flex-1 bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
            placeholder="Mensaje..."
            value={input}
            onChange={e => setInput(e.target.value.slice(0, 300))}
            onKeyDown={handleKeyDown}
            disabled={sending}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="w-9 h-9 rounded-full flex items-center justify-center transition-all flex-shrink-0 disabled:opacity-40"
            style={{ background: input.trim() ? 'linear-gradient(135deg, #2AABEE 0%, #229ED9 100%)' : 'transparent' }}
          >
            {sending
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              : <i className="fa-solid fa-paper-plane text-white text-sm" style={{ marginLeft: '-1px' }}></i>
            }
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatOyentes;
