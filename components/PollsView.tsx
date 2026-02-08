
import React, { useState, useEffect, useCallback } from 'react';
import { POLL_QUESTIONS_BANK, AutoPollQuestion } from '../constants';
import { GoogleGenAI } from "@google/genai";

interface Poll {
   id: string;
   question: string;
   options: string[];
   votes: Record<string, number>;
   endsAt: string;
   createdAt: string;
   sourceQuestionId?: string; // Para trackear qué pregunta del banco se usó
}

const STORAGE_KEY = 'radio540_polls';
const VOTED_KEY = 'radio540_voted';
const USED_QUESTIONS_KEY = 'radio540_used_questions'; // Preguntas ya usadas
const POLL_DURATION_HOURS = 24; // Duración de cada encuesta

const PollsView: React.FC = () => {
   const [poll, setPoll] = useState<Poll | null>(null);
   const [hasVoted, setHasVoted] = useState(false);
   const [timeRemaining, setTimeRemaining] = useState({ hours: 0, minutes: 0, seconds: 0, expired: false });
   const [showAdminPanel, setShowAdminPanel] = useState(false);
   const [newQuestion, setNewQuestion] = useState('');
   const [newOptions, setNewOptions] = useState(['', '', '']);
   const [newDuration, setNewDuration] = useState(12);
   const [message, setMessage] = useState('');
   const [isGeneratingAI, setIsGeneratingAI] = useState(false);

   // Función para obtener una pregunta aleatoria del banco que no se haya usado
   const getRandomUnusedQuestion = useCallback((): AutoPollQuestion | null => {
      const usedIds: string[] = JSON.parse(localStorage.getItem(USED_QUESTIONS_KEY) || '[]');
      const unusedQuestions = POLL_QUESTIONS_BANK.filter(q => !usedIds.includes(q.id));

      if (unusedQuestions.length === 0) {
         // Resetear el banco si se agotaron todas las preguntas
         localStorage.setItem(USED_QUESTIONS_KEY, '[]');
         return POLL_QUESTIONS_BANK[Math.floor(Math.random() * POLL_QUESTIONS_BANK.length)];
      }

      return unusedQuestions[Math.floor(Math.random() * unusedQuestions.length)];
   }, []);

   // Función para generar pregunta con AI (respaldo)
   const generateAIPoll = useCallback(async (): Promise<{ question: string; options: string[] } | null> => {
      try {
         const apiKey = process.env.API_KEY;
         if (!apiKey) return null;

         const ai = new GoogleGenAI({ apiKey });
         const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{
               parts: [{
                  text: `Genera UNA pregunta de votación para una radio peruana de cumbia llamada "La Nueva 5:40".
                  El tema puede ser: música, artistas peruanos de cumbia, preferencias del oyente, o diversión.
                  Responde SOLO en este formato JSON exacto, sin explicaciones:
                  {"question": "¿Tu pregunta aquí?", "options": ["Opción 1", "Opción 2", "Opción 3"]}`
               }]
            }]
         });

         const text = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
         const jsonMatch = text.match(/\{[\s\S]*\}/);
         if (jsonMatch) {
            return JSON.parse(jsonMatch[0]);
         }
         return null;
      } catch (error) {
         console.error('Error generating AI poll:', error);
         return null;
      }
   }, []);

   // Función para crear una encuesta automáticamente
   const createAutoPoll = useCallback(async (questionData: { question: string; options: string[]; id?: string }) => {
      const endsAt = new Date();
      endsAt.setHours(endsAt.getHours() + POLL_DURATION_HOURS);

      const votes: Record<string, number> = {};
      questionData.options.forEach(opt => votes[opt] = 0);

      const newPoll: Poll = {
         id: Date.now().toString(),
         question: questionData.question,
         options: questionData.options,
         votes,
         endsAt: endsAt.toISOString(),
         createdAt: new Date().toISOString(),
         sourceQuestionId: questionData.id
      };

      // Marcar la pregunta como usada si viene del banco
      if (questionData.id) {
         const usedIds: string[] = JSON.parse(localStorage.getItem(USED_QUESTIONS_KEY) || '[]');
         usedIds.push(questionData.id);
         localStorage.setItem(USED_QUESTIONS_KEY, JSON.stringify(usedIds));
      }

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPoll));
      setPoll(newPoll);
      setHasVoted(false);
   }, []);

   // Load poll from localStorage OR auto-generate if none exists
   useEffect(() => {
      const initPoll = async () => {
         const savedPoll = localStorage.getItem(STORAGE_KEY);

         if (savedPoll) {
            const parsed = JSON.parse(savedPoll) as Poll;
            // Check if poll is still active
            if (new Date(parsed.endsAt) > new Date()) {
               setPoll(parsed);
               // Check if user voted
               const votedPolls = JSON.parse(localStorage.getItem(VOTED_KEY) || '[]');
               setHasVoted(votedPolls.includes(parsed.id));
               return;
            } else {
               localStorage.removeItem(STORAGE_KEY);
            }
         }

         // No hay encuesta activa - generar una automáticamente
         const randomQuestion = getRandomUnusedQuestion();

         if (randomQuestion) {
            // Usar pregunta del banco
            await createAutoPoll({
               question: randomQuestion.question,
               options: randomQuestion.options,
               id: randomQuestion.id
            });
         } else {
            // Respaldo: usar AI
            setIsGeneratingAI(true);
            const aiQuestion = await generateAIPoll();
            setIsGeneratingAI(false);

            if (aiQuestion) {
               await createAutoPoll(aiQuestion);
            }
         }
      };

      initPoll();
   }, [getRandomUnusedQuestion, generateAIPoll, createAutoPoll]);

   // Countdown timer
   useEffect(() => {
      if (!poll) return;

      const updateTimer = () => {
         const now = new Date().getTime();
         const end = new Date(poll.endsAt).getTime();
         const diff = end - now;

         if (diff <= 0) {
            setTimeRemaining({ hours: 0, minutes: 0, seconds: 0, expired: true });
            localStorage.removeItem(STORAGE_KEY);
            setPoll(null);
            return;
         }

         const hours = Math.floor(diff / (1000 * 60 * 60));
         const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
         const seconds = Math.floor((diff % (1000 * 60)) / 1000);
         setTimeRemaining({ hours, minutes, seconds, expired: false });
      };

      updateTimer();
      const interval = setInterval(updateTimer, 1000);
      return () => clearInterval(interval);
   }, [poll]);

   // Handle vote
   const handleVote = (option: string) => {
      if (!poll || hasVoted) return;

      const updatedPoll = {
         ...poll,
         votes: {
            ...poll.votes,
            [option]: (poll.votes[option] || 0) + 1
         }
      };

      setPoll(updatedPoll);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPoll));

      // Mark as voted
      const votedPolls = JSON.parse(localStorage.getItem(VOTED_KEY) || '[]');
      votedPolls.push(poll.id);
      localStorage.setItem(VOTED_KEY, JSON.stringify(votedPolls));
      setHasVoted(true);

      setMessage('¡Gracias por votar! 🎉');
      setTimeout(() => setMessage(''), 3000);
   };

   // Create new poll
   const handleCreatePoll = () => {
      const question = newQuestion.trim();
      const validOptions = newOptions.filter(o => o.trim());

      if (!question) {
         setMessage('❌ Escribe una pregunta');
         return;
      }

      if (validOptions.length < 2) {
         setMessage('❌ Necesitas al menos 2 opciones');
         return;
      }

      const endsAt = new Date();
      endsAt.setHours(endsAt.getHours() + newDuration);

      const votes: Record<string, number> = {};
      validOptions.forEach(opt => votes[opt.trim()] = 0);

      const newPoll: Poll = {
         id: Date.now().toString(),
         question,
         options: validOptions.map(o => o.trim()),
         votes,
         endsAt: endsAt.toISOString(),
         createdAt: new Date().toISOString()
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(newPoll));
      setPoll(newPoll);
      setHasVoted(false);
      setShowAdminPanel(false);
      setNewQuestion('');
      setNewOptions(['', '', '']);
      setMessage('✅ ¡Encuesta creada exitosamente!');
      setTimeout(() => setMessage(''), 3000);
   };

   // Calculate totals
   const totalVotes = poll ? Object.values(poll.votes).reduce((sum, v) => sum + v, 0) : 0;
   const maxVotes = poll ? Math.max(...Object.values(poll.votes), 0) : 0;

   return (
      <div className="space-y-10 animate-fadeIn pb-32 max-w-4xl mx-auto px-4">
         {/* HEADER */}
         <header className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-full text-[10px] font-black uppercase tracking-[0.2em] shadow-xl animate-pulse">
               <span className="w-2 h-2 bg-white rounded-full"></span>
               EN VIVO: TU VOZ MANDA
            </div>
            <h2 className="text-4xl md:text-7xl font-black text-white tracking-tighter uppercase leading-none">
               EL BARRIO <br /> <span className="text-[#a3cf33]">DECIDE</span>
            </h2>
         </header>

         {/* MESSAGE */}
         {message && (
            <div className="text-center p-4 bg-[#a3cf33]/20 border border-[#a3cf33]/40 rounded-2xl text-white font-bold">
               {message}
            </div>
         )}

         {/* MINI GUÍA */}
         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/5 p-6 rounded-[2.5rem] border border-white/10">
            <div className="flex items-center gap-4 px-4">
               <div className="w-10 h-10 rounded-full bg-[#a3cf33] text-black flex items-center justify-center font-black">1</div>
               <p className="text-[10px] font-black uppercase text-white/80 leading-tight">Elige tu tema favorito</p>
            </div>
            <div className="flex items-center gap-4 px-4 border-y md:border-y-0 md:border-x border-white/10 py-4 md:py-0">
               <div className="w-10 h-10 rounded-full bg-[#3fb4e5] text-white flex items-center justify-center font-black">2</div>
               <p className="text-[10px] font-black uppercase text-white/80 leading-tight">Vota al toque</p>
            </div>
            <div className="flex items-center gap-4 px-4">
               <div className="w-10 h-10 rounded-full bg-orange-500 text-white flex items-center justify-center font-black">3</div>
               <p className="text-[10px] font-black uppercase text-white/80 leading-tight">¡El ganador suena!</p>
            </div>
         </div>

         {/* POLL CONTENT */}
         {poll && !timeRemaining.expired ? (
            <div className="glass-dark p-8 md:p-12 rounded-[3.5rem] border border-white/5 shadow-2xl relative overflow-hidden bg-slate-950/60">
               {/* COUNTDOWN */}
               <div className="absolute top-6 right-6 bg-red-600/20 border border-red-500/30 px-4 py-2 rounded-xl">
                  <p className="text-[8px] font-black text-red-400 uppercase tracking-widest mb-1">Tiempo restante</p>
                  <p className="text-xl font-mono font-black text-white">
                     {String(timeRemaining.hours).padStart(2, '0')}:
                     {String(timeRemaining.minutes).padStart(2, '0')}:
                     {String(timeRemaining.seconds).padStart(2, '0')}
                  </p>
               </div>

               <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10 border-b border-white/5 pb-8">
                  <div className="space-y-2">
                     <p className="text-[#a3cf33] text-[9px] font-black uppercase tracking-[0.3em]">Encuesta del Momento</p>
                     <h3 className="text-2xl md:text-3xl font-black text-white uppercase tracking-tight leading-none pr-32">{poll.question}</h3>
                  </div>
                  <div className="bg-black/40 px-6 py-3 rounded-2xl border border-white/10 text-center shrink-0">
                     <p className="text-[18px] font-black text-white leading-none">{totalVotes}</p>
                     <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest mt-1">Votos</p>
                  </div>
               </div>

               <div className="grid grid-cols-1 gap-4">
                  {poll.options.map((option) => {
                     const votes = poll.votes[option] || 0;
                     const percentage = totalVotes > 0 ? (votes / totalVotes) * 100 : 0;
                     const isLeader = votes === maxVotes && totalVotes > 0;

                     return (
                        <div key={option} className="relative">
                           {hasVoted ? (
                              <div className={`p-6 rounded-3xl border ${isLeader ? 'border-[#a3cf33]/40 bg-[#a3cf33]/5' : 'border-white/5 bg-white/5'} transition-all`}>
                                 <div className="flex justify-between items-center mb-3">
                                    <div className="flex items-center gap-3">
                                       {isLeader && <span className="text-orange-500 animate-pulse">🔥</span>}
                                       <span className={`text-xs font-black uppercase tracking-widest ${isLeader ? 'text-[#a3cf33]' : 'text-white'}`}>
                                          {option}
                                       </span>
                                    </div>
                                    <span className="font-mono font-black text-lg text-white tabular-nums">
                                       {percentage.toFixed(0)}%
                                    </span>
                                 </div>
                                 <div className="h-3 w-full bg-black/40 rounded-full overflow-hidden">
                                    <div
                                       className={`h-full transition-all duration-1000 ease-out ${isLeader ? 'bg-[#a3cf33]' : 'bg-slate-600'}`}
                                       style={{ width: `${percentage}%` }}
                                    ></div>
                                 </div>
                                 <div className="flex justify-between mt-2">
                                    <span className="text-[7px] font-black text-slate-600 uppercase tracking-widest">
                                       {isLeader ? '👑 LÍDER' : 'EN CARRERA'}
                                    </span>
                                    <span className="text-[8px] font-black text-white/40">{votes} VOTOS</span>
                                 </div>
                              </div>
                           ) : (
                              <button
                                 onClick={() => handleVote(option)}
                                 className="w-full group relative p-6 rounded-3xl bg-white/5 border border-white/10 hover:border-[#a3cf33] hover:bg-white/10 transition-all active:scale-95 text-left flex items-center justify-between gap-4"
                              >
                                 <div className="flex items-center gap-5">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/10 flex items-center justify-center text-slate-500 group-hover:bg-[#a3cf33] group-hover:text-black transition-all">
                                       🎵
                                    </div>
                                    <span className="text-sm font-black text-white uppercase tracking-tight">
                                       {option}
                                    </span>
                                 </div>
                                 <div className="bg-[#a3cf33] text-black px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">
                                    VOTAR ✓
                                 </div>
                              </button>
                           )}
                        </div>
                     );
                  })}
               </div>

               {hasVoted && (
                  <div className="mt-8 text-center">
                     <p className="text-[#a3cf33] text-[9px] font-black uppercase tracking-[0.3em]">
                        ¡Gracias por votar, batería! 🎉
                     </p>
                  </div>
               )}
            </div>
         ) : (
            <div className="glass-dark p-12 rounded-[3.5rem] border border-white/5 text-center">
               {isGeneratingAI ? (
                  <>
                     <p className="text-4xl mb-4 animate-pulse">🤖</p>
                     <h3 className="text-2xl font-black text-white mb-2">Generando encuesta con AI...</h3>
                     <p className="text-slate-500 text-sm">Espera un momento, estamos creando algo especial</p>
                  </>
               ) : (
                  <>
                     <p className="text-4xl mb-4 animate-spin">⏳</p>
                     <h3 className="text-2xl font-black text-white mb-2">Cargando encuesta...</h3>
                     <p className="text-slate-500 text-sm">Preparando la votación del día</p>
                  </>
               )}
            </div>
         )}

         {/* ADMIN PANEL */}
         <div className="text-center">
            <button
               onClick={() => setShowAdminPanel(!showAdminPanel)}
               className="text-xs text-slate-600 hover:text-white transition-colors px-4 py-2"
            >
               ⚙️ Panel de Administrador
            </button>
         </div>

         {showAdminPanel && (
            <div className="glass-dark p-8 rounded-3xl border border-white/10 space-y-6">
               <h4 className="text-xl font-black text-white">Crear Nueva Encuesta</h4>

               <div>
                  <label className="text-xs text-slate-400 mb-2 block">Pregunta:</label>
                  <input
                     type="text"
                     value={newQuestion}
                     onChange={(e) => setNewQuestion(e.target.value)}
                     placeholder="¿Qué género quieres escuchar?"
                     className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600"
                  />
               </div>

               <div>
                  <label className="text-xs text-slate-400 mb-2 block">Opciones:</label>
                  {newOptions.map((opt, idx) => (
                     <input
                        key={idx}
                        type="text"
                        value={opt}
                        onChange={(e) => {
                           const updated = [...newOptions];
                           updated[idx] = e.target.value;
                           setNewOptions(updated);
                        }}
                        placeholder={`Opción ${idx + 1}`}
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-slate-600 mb-2"
                     />
                  ))}
                  <button
                     onClick={() => setNewOptions([...newOptions, ''])}
                     className="text-xs text-[#a3cf33] hover:underline"
                  >
                     + Agregar opción
                  </button>
               </div>

               <div>
                  <label className="text-xs text-slate-400 mb-2 block">Duración (horas):</label>
                  <input
                     type="number"
                     value={newDuration}
                     onChange={(e) => setNewDuration(Number(e.target.value))}
                     min={1}
                     max={48}
                     className="w-32 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white"
                  />
               </div>

               <button
                  onClick={handleCreatePoll}
                  className="w-full bg-[#a3cf33] text-black font-black py-4 rounded-xl hover:bg-[#b5e043] transition-colors active:scale-95"
               >
                  🚀 CREAR ENCUESTA
               </button>
            </div>
         )}

         <div className="pt-10 flex flex-col items-center gap-4">
            <div className="w-20 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
            <p className="text-slate-600 text-[8px] font-black uppercase tracking-[0.6em] text-center">
               SISTEMA DE VOTACIÓN LA NUEVA 5:40
            </p>
         </div>
      </div>
   );
};

export default PollsView;
