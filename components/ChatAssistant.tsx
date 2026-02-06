
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { RADIO_STREAM_URL, RADIO_STREAM_CUMBIAS, RADIO_STREAM_HUAYNOS } from '../constants';
import { decodeAudioData, encodeToBase64, decodeFromBase64 } from '../utils/audioUtils';

// --- TYPES ---
interface FunctionCall {
  id: string;
  name: string;
  args: Record<string, unknown>;
}

interface Example {
  icon: string;
  text: string;
  color: string;
}

// --- COMPONENT ---
const ChatAssistant: React.FC = () => {
  const [isVoiceMode, setIsVoiceMode] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);

  const audioContextRef = useRef<AudioContext | null>(null);
  const sessionRef = useRef<{ close: () => void } | null>(null);
  const nextStartTimeRef = useRef(0);
  const sourcesRef = useRef<Set<AudioBufferSourceNode>>(new Set());
  const originalVolumeRef = useRef<number>(1);
  const isSpeakingRef = useRef(false);

  const examples: Example[] = [
    { icon: "fa-volume-high", text: "¡Súbele al volumen, causa!", color: "#a3cf33" },
    { icon: "fa-radio", text: "Pon la radio de cumbias", color: "#3fb4e5" },
    { icon: "fa-star", text: "¿Cuál es mi horóscopo hoy?", color: "#FFD700" },
    { icon: "fa-fire", text: "Dame un chisme de la farándula", color: "#FF5252" },
    { icon: "fa-clock", text: "¿Qué hora es en Perú?", color: "#E040FB" },
    { icon: "fa-calendar", text: "¿Qué eventos hay esta semana?", color: "#00E5FF" },
    { icon: "fa-heart", text: "Mándame un saludo romántico", color: "#FF69B4" },
    { icon: "fa-bolt", text: "¿Qué noticias hay hoy?", color: "#FFA500" }
  ];

  // --- DECLARACIONES DE FUNCIONES (TOOLS) ---
  const toolDeclarations: FunctionDeclaration[] = [
    {
      name: 'cambiarEstacion',
      parameters: {
        type: Type.OBJECT,
        description: 'Cambia la señal de radio.',
        properties: {
          estacion: { type: Type.STRING, description: 'Estación: "principal", "cumbias" o "huaynos".' }
        },
        required: ['estacion'],
      },
    },
    {
      name: 'ajustarVolumen',
      parameters: {
        type: Type.OBJECT,
        description: 'Ajusta el volumen de la radio.',
        properties: {
          nivel: { type: Type.NUMBER, description: 'Nivel de 0 a 100.' }
        },
        required: ['nivel'],
      },
    },
    {
      name: 'controlarReproduccion',
      parameters: {
        type: Type.OBJECT,
        description: 'Controla si la radio está sonando o en pausa.',
        properties: {
          accion: { type: Type.STRING, description: 'Acción: "play" o "pause".' }
        },
        required: ['accion'],
      },
    }
  ];

  const handleToolCall = (fc: FunctionCall): string => {
    if (fc.name === 'cambiarEstacion') {
      let target = RADIO_STREAM_URL;
      const e = (fc.args.estacion as string).toLowerCase();
      if (e.includes('cumbia')) target = RADIO_STREAM_CUMBIAS;
      else if (e.includes('huayno')) target = RADIO_STREAM_HUAYNOS;

      localStorage.setItem('radio_stream_url_active', target);
      window.dispatchEvent(new Event('radio_url_changed'));
      window.dispatchEvent(new CustomEvent('radio_playback_control', { detail: { action: 'play' } }));
      return "OK, estación cambiada";
    }

    if (fc.name === 'ajustarVolumen') {
      const level = Math.min(Math.max((fc.args.nivel as number) / 100, 0), 1);
      window.dispatchEvent(new CustomEvent('radio_volume_change', { detail: { level } }));
      return `Volumen ajustado`;
    }

    if (fc.name === 'controlarReproduccion') {
      const action = (fc.args.accion as string).toLowerCase();
      window.dispatchEvent(new CustomEvent('radio_playback_control', { detail: { action: action === 'play' ? 'play' : 'pause' } }));
      return `Radio en modo ${action}`;
    }

    return "Error: Función desconocida";
  };

  // Ducking: lower radio volume when AI speaks
  const duckVolume = () => {
    if (!isSpeakingRef.current) {
      isSpeakingRef.current = true;
      // Save current volume and lower to 20%
      window.dispatchEvent(new CustomEvent('radio_volume_duck', { detail: { duck: true } }));
    }
  };

  const restoreVolume = () => {
    if (isSpeakingRef.current) {
      isSpeakingRef.current = false;
      // Restore original volume
      window.dispatchEvent(new CustomEvent('radio_volume_duck', { detail: { duck: false } }));
    }
  };

  const stopVoiceSession = () => {
    if (sessionRef.current) sessionRef.current.close();
    sourcesRef.current.forEach(s => s.stop());
    sourcesRef.current.clear();
    restoreVolume();
    setIsVoiceMode(false);
    setIsConnecting(false);
  };

  const startVoiceSession = async () => {
    setIsConnecting(true);
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      alert("Configura tu API Key en los ajustes");
      setIsConnecting(false);
      return;
    }
    const ai = new GoogleGenAI({ apiKey });

    const inputCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({ sampleRate: 16000 });
    const outputCtx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)({ sampleRate: 24000 });
    audioContextRef.current = outputCtx;

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        callbacks: {
          onopen: () => {
            setIsVoiceMode(true);
            setIsConnecting(false);
            const source = inputCtx.createMediaStreamSource(stream);
            const scriptProcessor = inputCtx.createScriptProcessor(4096, 1, 1);
            scriptProcessor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const int16 = new Int16Array(inputData.length);
              for (let i = 0; i < inputData.length; i++) int16[i] = inputData[i] * 32768;
              const pcmBlob = { data: encodeToBase64(new Uint8Array(int16.buffer)), mimeType: 'audio/pcm;rate=16000' };
              sessionPromise.then(s => s.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(inputCtx.destination);
          },
          onmessage: async (message: LiveServerMessage) => {
            if (message.toolCall) {
              for (const fc of message.toolCall.functionCalls) {
                const result = handleToolCall(fc as unknown as FunctionCall);
                sessionPromise.then(s => s.sendToolResponse({
                  functionResponses: { id: fc.id, name: fc.name, response: { result } }
                }));
              }
            }

            const audioData = message.serverContent?.modelTurn?.parts[0]?.inlineData?.data;
            if (audioData && audioContextRef.current) {
              duckVolume(); // Lower radio volume when AI speaks
              const ctx = audioContextRef.current;
              nextStartTimeRef.current = Math.max(nextStartTimeRef.current, ctx.currentTime);
              const buffer = await decodeAudioData(decodeFromBase64(audioData), ctx, 24000, 1);
              const source = ctx.createBufferSource();
              source.buffer = buffer;
              source.connect(ctx.destination);
              source.start(nextStartTimeRef.current);
              nextStartTimeRef.current += buffer.duration;
              sourcesRef.current.add(source);
              // Restore volume when audio finishes
              source.onended = () => {
                sourcesRef.current.delete(source);
                if (sourcesRef.current.size === 0) {
                  restoreVolume();
                }
              };
            }

            if (message.serverContent?.interrupted) {
              sourcesRef.current.forEach(s => s.stop());
              sourcesRef.current.clear();
              nextStartTimeRef.current = 0;
            }
          }
        },
        config: {
          responseModalities: [Modality.AUDIO],
          tools: [{ functionDeclarations: toolDeclarations }],
          systemInstruction: "Eres el DJ Operador de 'La Nueva 5:40 Radio', la radio más popular de Huarochirí y San Juan de Lurigancho. Hablas como un locutor peruano experto con mucha chispa.\n\nTIENES EL PODER DE LA CABINA:\n1. Si te piden música, usa 'cambiarEstacion'.\n2. Si te dicen 'sube el volumen', usa 'ajustarVolumen'.\n3. Si te dicen 'dale play' o 'ponle pausa', usa 'controlarReproduccion'.\n\nTAMBIÉN PUEDES:\n- Dar HORÓSCOPOS divertidos y positivos para cada signo zodiacal\n- Contar CHISMES de farándula peruana e internacional (invéntate chismes graciosos y ficticios)\n- Decir la HORA actual en Perú\n- Mandar SALUDOS personalizados bien emotivos\n- Contar CHISTES y hacer reír a la gente\n- Hablar de EVENTOS y fiestas próximas\n- Dar CONSEJOS de amor como buen DJ romántico\n\nUSA JERGA PERUANA: 'Habla batería', 'Fuego causita', 'Gente bonita', 'Oe mi broder', 'Chibolos y chibolitas', 'PeAches', 'Al toque'. Sé muy expresivo y carismático. ¡Eres el alma de la fiesta!",
          speechConfig: { voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } } }
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (e) {
      console.error(e);
      setIsConnecting(false);
    }
  };

  return (
    <div className="h-[calc(100vh-280px)] flex flex-col glass rounded-[2.5rem] overflow-hidden animate-fadeIn border border-white/10 shadow-2xl bg-slate-950/40 relative">
      {/* Header Cabina */}
      <div className="bg-slate-900 p-5 border-b border-white/10 flex items-center justify-between z-20">
        <div className="flex items-center gap-4">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-slate-900 shadow-lg ${isVoiceMode ? 'bg-red-500 animate-pulse' : 'bg-[#a3cf33]'}`}>
            <i className={`fa-solid ${isVoiceMode ? 'fa-microphone' : 'fa-robot'}`}></i>
          </div>
          <div>
            <h3 className="font-black text-white text-xs uppercase tracking-wider">{isVoiceMode ? 'Operador de Cabina' : 'Asistente DJ AI'}</h3>
            <span className="text-[8px] text-[#a3cf33] font-black uppercase tracking-widest flex items-center gap-1">
              <span className={`w-1.5 h-1.5 rounded-full ${isVoiceMode ? 'bg-red-500 animate-pulse' : 'bg-[#a3cf33]'}`}></span>
              {isVoiceMode ? 'CONSOLA ACTIVA' : 'SISTEMA INTELIGENTE'}
            </span>
          </div>
        </div>
        {isVoiceMode && (
          <button onClick={stopVoiceSession} className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[8px] font-black text-white uppercase tracking-widest hover:bg-red-500/20">
            Cerrar Consola
          </button>
        )}
      </div>

      {/* Area Central */}
      <div className="flex-1 flex flex-col p-6 overflow-y-auto no-scrollbar relative">
        {isVoiceMode ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-10">
            <div className="flex gap-1.5 items-end h-24">
              {[...Array(24)].map((_, i) => (
                <div key={i} className="w-2 bg-[#a3cf33] rounded-full animate-bounce" style={{ height: `${20 + Math.random() * 80}%`, animationDuration: `${0.3 + Math.random() * 0.7}s` }}></div>
              ))}
            </div>
            <div className="text-center space-y-3">
              <p className="text-[#a3cf33] font-black text-sm uppercase tracking-[0.4em] animate-pulse">¡El DJ te escucha!</p>
              <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Pide lo que quieras pal barrio...</p>
            </div>
          </div>
        ) : (
          <div className="space-y-8 h-full flex flex-col">
            <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6">
              <div className="w-24 h-24 bg-white/5 rounded-full flex items-center justify-center border border-white/10 relative">
                <div className="absolute inset-0 bg-[#a3cf33]/5 rounded-full blur-xl animate-pulse"></div>
                <i className="fa-solid fa-microphone-lines text-4xl text-slate-700"></i>
              </div>
              <div className="space-y-2">
                <p className="text-white text-xs font-black uppercase tracking-widest">¿Qué le vas a decir al DJ?</p>
                <p className="text-slate-500 text-[9px] font-bold uppercase tracking-[0.3em]">Toca el micro abajo para empezar</p>
              </div>
            </div>

            <div className="space-y-4 pb-20">
              <p className="text-slate-600 text-[8px] font-black uppercase tracking-[0.5em] text-center">Ejemplos de comandos</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {examples.map((ex, i) => (
                  <div key={i} className="flex items-center gap-4 p-4 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-default group">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-black/40 text-sm group-hover:scale-110 transition-transform" style={{ color: ex.color }}>
                      <i className={`fa-solid ${ex.icon}`}></i>
                    </div>
                    <p className="text-white/70 text-[10px] font-black uppercase tracking-tight line-clamp-1">{ex.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Botón Flotante */}
      {!isVoiceMode && (
        <div className="absolute bottom-10 left-0 right-0 flex justify-center z-30">
          <button
            onClick={startVoiceSession}
            disabled={isConnecting}
            className={`w-20 h-20 rounded-full bg-[#a3cf33] text-slate-900 shadow-[0_0_40px_rgba(163,207,51,0.4)] flex items-center justify-center transition-all hover:scale-110 active:scale-90 ${isConnecting ? 'animate-pulse' : ''}`}
          >
            {isConnecting ? (
              <i className="fa-solid fa-spinner animate-spin text-2xl"></i>
            ) : (
              <i className="fa-solid fa-microphone text-2xl"></i>
            )}
          </button>
        </div>
      )}
    </div>
  );
};

export default ChatAssistant;
