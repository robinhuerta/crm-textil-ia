import React from 'react';
import { ActNowAction } from '../types';
import { 
  Zap, 
  AlertCircle, 
  TrendingUp, 
  ChevronRight,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface Props {
  actions: ActNowAction[];
  onActionClick: (action: ActNowAction) => void;
}

export const ActNowBanner: React.FC<Props> = ({ actions, onActionClick }) => {
  if (actions.length === 0) return null;

  return (
    <div className="space-y-4 mb-8">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2">
          <Sparkles size={16} className="text-amber-400" />
          <h3 className="text-[11px] uppercase font-black tracking-[0.2em] text-slate-500">
            MOTOR SMART ACT-NOW
          </h3>
        </div>
        <span className="text-[10px] text-indigo-400 font-bold bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-500/20 uppercase tracking-widest">
           3 Acciones Sugeridas
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {actions.slice(0, 3).map((action) => (
          <div 
            key={action.id}
            onClick={() => onActionClick(action)}
            className={`relative overflow-hidden group cursor-pointer transition-all hover:scale-[1.02] p-5 rounded-2xl border ${
              action.type === 'urgent' 
                ? 'bg-red-500/5 border-red-500/20 hover:border-red-500/40' 
                : action.type === 'opportunity'
                ? 'bg-emerald-500/5 border-emerald-500/20 hover:border-emerald-500/40'
                : 'bg-indigo-500/5 border-indigo-500/20 hover:border-indigo-500/40'
            }`}
          >
            {/* Background Icon Decoration */}
            <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:opacity-20 transition-opacity">
               {action.type === 'urgent' ? <AlertCircle size={80} /> : action.type === 'opportunity' ? <TrendingUp size={80} /> : <Zap size={80} />}
            </div>

            <div className="relative z-10 flex flex-col h-full">
              <div className="flex justify-between items-start mb-3">
                <div className={`p-2 rounded-lg ${
                  action.type === 'urgent' ? 'bg-red-500/10 text-red-400' : 'bg-indigo-500/10 text-indigo-400'
                }`}>
                   {action.type === 'urgent' ? <AlertCircle size={18} /> : <Zap size={18} />}
                </div>
                <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                   Prioridad {action.score}
                </div>
              </div>

              <h4 className="text-white font-bold text-sm mb-2 group-hover:text-amber-300 transition-colors">
                {action.title}
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed mb-4 flex-1">
                {action.description}
              </p>

              <div className="flex items-center gap-2 pt-3 border-t border-white/5 mt-2">
                <span className="text-[10px] font-bold text-indigo-400 truncate max-w-[120px]">
                  {action.targetName}
                </span>
                <ChevronRight size={12} className="text-slate-600 group-hover:translate-x-1 transition-transform ml-auto" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
