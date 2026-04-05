import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Upload, 
  FileText, 
  ArrowRight, 
  Loader2, 
  UserPlus, 
  CheckCircle2, 
  History 
} from 'lucide-react';
import { extractLeadFromText } from '../utils/aiService';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  onClose: () => void;
  onConfirm: (data: any) => void;
}

export const LeadCapture: React.FC<Props> = ({ onClose, onConfirm }) => {
  const [inputMode, setInputMode] = useState<'text' | 'image'>('text');
  const [text, setText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [result, setResult] = useState<any>(null);

  const handleProcess = async () => {
    if (!text.trim()) return;
    setIsProcessing(true);
    try {
      const data = await extractLeadFromText(text);
      setResult(data);
    } catch (e) {
      console.error(e);
      alert("Error procesando con IA. Verifica la API Key.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSave = () => {
    onConfirm(result);
    onClose();
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/80 backdrop-blur-md z-[500] flex items-center justify-center p-4"
    >
      <motion.div 
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-[#0a0f19] border border-white/10 w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-8 border-b border-white/5 bg-gradient-to-r from-indigo-500/10 to-purple-500/10 flex justify-between items-center">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-indigo-500/20 flex items-center justify-center text-indigo-400">
               <Sparkles size={20} />
             </div>
             <div>
               <h2 className="text-xl font-bold text-white tracking-tight">Captura Inteligente IA</h2>
               <p className="text-xs text-indigo-400 font-bold uppercase tracking-widest">Growth Engine</p>
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
        <div className="flex-1 overflow-y-auto p-8 no-scrollbar">
          {!result ? (
            <div className="space-y-6">
              <div className="flex gap-4 p-1 bg-white/5 rounded-2xl w-fit mx-auto mb-8">
                <button 
                  onClick={() => setInputMode('text')}
                  className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${inputMode === 'text' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Texto / Notas
                </button>
                <button 
                  onClick={() => setInputMode('image')}
                  className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${inputMode === 'image' ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:text-slate-300'}`}
                >
                  Imagen / Tarjeta
                </button>
              </div>

              {inputMode === 'text' ? (
                <div className="space-y-4">
                  <p className="text-sm text-slate-400 text-center px-8">
                    Pega tus notas rápidas, transcripciones de llamadas o apuntes de una feria textil.
                  </p>
                  <textarea 
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                    placeholder="Ejem: 'Hablé con Alberto de Textil Huánuco en la feria ITMA. Necesita cotización de 5 telares Stoll y repuestos para un CMS 530 que dice que está detenido. Dice que le urge. Email: amorales@textil.com...'"
                    className="w-full h-48 bg-white/5 border border-white/10 rounded-2xl p-6 text-slate-200 placeholder:text-slate-600 outline-none focus:border-indigo-500/50 transition-all resize-none text-sm leading-relaxed"
                  />
                  <button 
                    onClick={handleProcess}
                    disabled={isProcessing || !text.trim()}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold rounded-2xl transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-3"
                  >
                    {isProcessing ? <Loader2 className="animate-spin" /> : <Sparkles size={18} />}
                    {isProcessing ? "Procesando con IA..." : "Extraer Oportunidad"}
                  </button>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center border-2 border-dashed border-white/10 rounded-2xl p-12 hover:border-indigo-500/30 transition-all cursor-pointer group">
                  <div className="w-20 h-20 rounded-full bg-white/5 flex items-center justify-center text-slate-500 group-hover:text-amber-400 transition-colors mb-4">
                     <Upload size={32} />
                  </div>
                  <p className="text-white font-bold mb-1">Subir Tarjeta o Captura</p>
                  <p className="text-slate-500 text-xs uppercase tracking-widest font-black">PNG, JPG hasta 5MB</p>
                  <p className="mt-8 text-[10px] text-amber-500/50">Módulo OCR Visual (En progreso)</p>
                </div>
              )}
            </div>
          ) : (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center gap-2 text-emerald-400 mb-6 bg-emerald-500/5 p-3 rounded-xl border border-emerald-500/10">
                <CheckCircle2 size={16} />
                <span className="text-xs font-bold uppercase tracking-widest">Información Detectada</span>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <ResultField label="Contacto" value={result.name} />
                <ResultField label="Empresa" value={result.company} />
                <ResultField label="Cargo" value={result.role} />
                <ResultField label="Prioridad" value={result.priority} color={result.priority === 'high' ? 'text-red-400' : 'text-amber-400'} />
              </div>

              <div className="space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2">Intereses Técnicos (Maquinaria)</h4>
                  <div className="flex flex-wrap gap-2">
                    {result.machineryInterests?.map((item: string, i: number) => (
                      <span key={i} className="bg-indigo-500/10 text-indigo-400 text-[10px] font-bold px-2 py-1 rounded-full border border-indigo-500/20">
                        {item}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
                  <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2">Resumen de IA</h4>
                  <p className="text-xs text-slate-300 italic leading-relaxed">"{result.summary}"</p>
                </div>

                <div className="space-y-2">
                  <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-500 px-1">Próximos Pasos</h4>
                  {result.nextSteps?.map((step: string, i: number) => (
                    <div key={i} className="flex items-center gap-3 bg-white/[0.02] p-2 rounded-lg text-xs text-slate-400">
                       <ArrowRight size={12} className="text-indigo-500" />
                       {step}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        {result && (
          <div className="p-8 border-t border-white/5 bg-white/[0.01] flex gap-3">
             <button 
              onClick={() => setResult(null)}
              className="flex-1 bg-white/5 text-slate-400 font-bold py-3 rounded-2xl text-sm hover:text-white transition-all flex items-center justify-center gap-2"
             >
                <History size={16} />
                Volver a Capturar
             </button>
             <button 
              onClick={handleSave}
              className="flex-3 bg-indigo-600 hover:bg-indigo-500 text-white font-black py-4 rounded-2xl text-sm transition-all shadow-xl shadow-indigo-500/30 flex items-center justify-center gap-2"
             >
                <UserPlus size={18} />
                Confirmar y Crear Oportunidad
             </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
};

const ResultField: React.FC<{ label: string, value: string, color?: string }> = ({ label, value, color }) => (
  <div className="bg-white/[0.03] border border-white/5 p-3 rounded-xl">
    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">{label}</p>
    <p className={`text-sm font-bold truncate ${color || 'text-white'}`}>{value || 'No detectado'}</p>
  </div>
);
