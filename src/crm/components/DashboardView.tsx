import React from 'react';
import { ActNowBanner } from './ActNowBanner';
import { calculateActNowActions } from '../utils/priorityEngine';
import { INITIAL_DEALS, INITIAL_CONTACTS } from '../../constants';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  Calendar, 
  ArrowUpRight, 
  Target,
  Clock,
  Sparkles
} from 'lucide-react';

export const DashboardView: React.FC = () => {
  const actions = calculateActNowActions(INITIAL_DEALS, INITIAL_CONTACTS);
  
  const totalValue = INITIAL_DEALS.reduce((sum, deal) => sum + deal.value, 0);
  const activeDeals = INITIAL_DEALS.filter(d => d.stage !== 'closed_won').length;

  return (
    <div className="p-8 space-y-8 animate-fadeIn max-w-7xl mx-auto">
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Panel de Control</h2>
          <p className="text-slate-400 text-sm">Tu asistente de ventas inteligente para el sector textil.</p>
        </div>
        <div className="flex items-center gap-4 text-[10px] text-slate-500 font-black uppercase tracking-widest bg-white/5 px-4 py-2 rounded-full border border-white/5">
           <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
           Sincronizado hace 1 minuto
        </div>
      </div>

      {/* Act Now Engine */}
      <ActNowBanner actions={actions} onActionClick={(a) => console.log('Action:', a.title)} />

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <MetricCard 
          icon={<Target className="text-indigo-400" size={20} />} 
          label="Valor de Pipeline" 
          value={`$${(totalValue / 1000).toFixed(1)}k`} 
          change="+12.5%" 
          positive 
        />
        <MetricCard 
          icon={<TrendingUp className="text-emerald-400" size={20} />} 
          label="Tratos Activos" 
          value={activeDeals.toString()} 
          change="+2" 
          positive 
        />
        <MetricCard 
          icon={<Users className="text-purple-400" size={20} />} 
          label="Nuevos Leads" 
          value="8" 
          change="-3%" 
        />
        <MetricCard 
          icon={<Calendar className="text-amber-400" size={20} />} 
          label="Citas Pendientes" 
          value="4" 
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Chart Placeholder */}
        <div className="lg:col-span-2 bg-[#0a1120] border border-white/5 rounded-3xl p-8 relative overflow-hidden">
           <div className="flex justify-between items-center mb-12">
              <div>
                <h4 className="text-white font-bold text-lg">Proyección de Ventas Mensuales</h4>
                <p className="text-slate-500 text-xs">Comparativa de Maquinaria vs. Suministros</p>
              </div>
              <div className="flex gap-2">
                 <div className="flex items-center gap-2 text-[10px] text-slate-500"><div className="w-2 h-2 rounded-full bg-indigo-500" /> Maquinaria</div>
                 <div className="flex items-center gap-2 text-[10px] text-slate-500"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Suministros</div>
              </div>
           </div>
           
           <div className="h-64 flex items-end justify-between px-4 pb-2">
              {[40, 25, 60, 45, 90, 75, 45].map((h, i) => (
                <div key={i} className="w-12 bg-indigo-500/10 rounded-t-lg relative group transition-all hover:bg-indigo-500/20" style={{ height: `${h}%` }}>
                   <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 text-[10px] text-slate-600 font-bold">L-h</div>
                </div>
              ))}
           </div>
        </div>

        {/* Activity Feed */}
        <div className="bg-[#0a1120] border border-white/5 rounded-3xl p-6">
           <h4 className="text-white font-bold mb-6 flex items-center gap-2">
             <Clock size={16} className="text-slate-500" />
             Actividad Reciente
           </h4>
           <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/5">
              <ActivityItem icon={<Sparkles size={10} />} title="Lead detectado por IA" company="Hilados del Sur" time="15m" />
              <ActivityItem icon={<TrendingUp size={10} />} title="Trato movido a Negociación" company="Textil Huánuco" time="2h" />
              <ActivityItem icon={<Users size={10} />} title="Nueva nota de visita" company="Inversiones Textiles" time="5h" />
           </div>
           <button className="w-full mt-8 py-3 rounded-xl border border-white/5 text-xs text-slate-500 font-bold hover:bg-white/5 hover:text-white transition-all">Ver Historial Completo</button>
        </div>
      </div>
    </div>
  );
};

const MetricCard: React.FC<{ icon: React.ReactNode, label: string, value: string, change?: string, positive?: boolean }> = ({ icon, label, value, change, positive }) => (
  <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.04] transition-all group">
    <div className="flex justify-between items-start mb-4">
      <div className="w-12 h-12 rounded-2xl bg-[#0a1120] flex items-center justify-center border border-white/5 shadow-inner">
        {icon}
      </div>
      {change && (
        <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${positive ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-red-500/10 text-red-400 border-red-500/20'} border`}>
          {change}
        </span>
      )}
    </div>
    <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">{label}</p>
    <div className="flex items-center justify-between">
      <h3 className="text-2xl font-bold text-white tracking-tight">{value}</h3>
      <ArrowUpRight size={16} className="text-slate-700 opacity-0 group-hover:opacity-100 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
    </div>
  </div>
);

const ActivityItem: React.FC<{ icon: React.ReactNode, title: string, company: string, time: string }> = ({ icon, title, company, time }) => (
  <div className="relative pl-8 group">
    <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-[#05080f] border border-white/10 flex items-center justify-center text-indigo-400 z-10 group-hover:scale-110 group-hover:border-indigo-500/50 transition-all">
      {icon}
    </div>
    <div>
      <div className="flex justify-between items-start">
        <p className="text-xs text-white font-bold group-hover:text-indigo-400 transition-colors leading-tight">{title}</p>
        <span className="text-[10px] text-slate-600 ml-2 font-mono">{time}</span>
      </div>
      <p className="text-[10px] text-slate-500 uppercase tracking-widest font-black mt-1">{company}</p>
    </div>
  </div>
);
