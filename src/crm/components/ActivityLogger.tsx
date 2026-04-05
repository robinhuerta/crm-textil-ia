import React, { useState } from 'react';
import { 
  X, 
  Phone, 
  Mail, 
  Users, 
  Settings2, 
  MessageSquare,
  ChevronDown,
  Clock,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onClose: () => void;
  onLog: (activity: any) => void;
  targetName: string;
}

export const ActivityLogger: React.FC<Props> = ({ onClose, onLog, targetName }) => {
  const [type, setType] = useState<'call' | 'email' | 'meeting' | 'note' | 'maintenance'>('call');
  const [content, setContent] = useState('');

  const types = [
    { id: 'call', icon: <Phone size={14} />, label: 'Llamada' },
    { id: 'email', icon: <Mail size={14} />, label: 'Email' },
    { id: 'meeting', icon: <Users size={14} />, label: 'Visita Planta' },
    { id: 'maintenance', icon: <Settings2 size={14} />, label: 'Mantenimiento' },
    { id: 'note', icon: <MessageSquare size={14} />, label: 'Nota Rápida' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[500] flex items-center justify-center p-4 transition-all"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-[#0a0f19] border border-white/10 w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-6 border-b border-white/5 bg-gradient-to-r from-emerald-500/10 to-indigo-500/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-emerald-500/20 flex items-center justify-center text-emerald-400">
               <Clock size={20} />
             </div>
             <div>
               <h2 className="text-xl font-bold text-white tracking-tight leading-none">Registrar Actividad</h2>
               <p className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mt-1">Con {targetName}</p>
             </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 transition-all border border-white/5"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="p-8 space-y-6">
          <div className="space-y-4">
             <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 px-1">Tipo de Interacción</p>
             <div className="grid grid-cols-3 gap-2">
                {types.map((t) => (
                  <button 
                    key={t.id}
                    onClick={() => setType(t.id as any)}
                    className={`flex flex-col items-center justify-center py-4 rounded-xl border transition-all gap-2 ${type === t.id ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 font-bold' : 'bg-white/5 border-white/5 text-slate-500 hover:bg-white/10 hover:text-slate-300'}`}
                  >
                    {t.icon}
                    <span className="text-[9px] uppercase tracking-widest leading-none">{t.label}</span>
                  </button>
                ))}
             </div>
          </div>

          <div className="space-y-4">
             <div className="flex justify-between items-center px-1">
                <p className="text-[10px] uppercase font-black tracking-widest text-slate-500">Detalle de la Actividad</p>
                <div className="flex items-center gap-1 text-[10px] text-indigo-400 font-bold opacity-60">
                   <Sparkles size={10} />
                   <span>IA ACTIVADA</span>
                </div>
             </div>
             <textarea 
               value={content}
               onChange={(e) => setContent(e.target.value)}
               placeholder={`Escribe qué sucedió en la ${type}...`}
               className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-4 text-slate-200 placeholder:text-slate-600 outline-none focus:border-emerald-500/40 transition-all resize-none text-sm leading-relaxed"
             />
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-white/5 bg-white/[0.01]">
           <button 
            onClick={() => onLog({ type, content })}
            disabled={!content.trim()}
            className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white font-black py-4 rounded-2xl text-sm transition-all shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2"
           >
              Guardar Actividad
           </button>
        </div>
      </motion.div>
    </motion.div>
  );
};
