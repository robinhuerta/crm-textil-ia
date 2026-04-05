import React from 'react';
import { INITIAL_INVOICES, INITIAL_DEALS } from '../constants';
import { 
  DollarSign, AlertTriangle, CheckCircle2, Clock, 
  TrendingUp, ArrowUpRight, FileText, MoreVertical, 
  CreditCard, PieChart
} from 'lucide-react';

export const FinanceView: React.FC = () => {
  const totalPipeline = INITIAL_DEALS.reduce((s, d) => s + d.value, 0);
  const totalPaid = INITIAL_INVOICES.filter(i => i.status === 'paid').reduce((s, i) => s + i.amount, 0);
  const totalPending = INITIAL_INVOICES.filter(i => i.status === 'pending').reduce((s, i) => s + i.amount, 0);
  const totalOverdue = INITIAL_INVOICES.filter(i => i.status === 'overdue').reduce((s, i) => s + i.amount, 0);

  return (
    <div className="p-8 animate-fadeIn max-w-7xl mx-auto space-y-8">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Finanzas y Cobros</h2>
        <p className="text-slate-400 text-sm">Control de facturación, cuentas por cobrar y flujo de caja.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <FinMetric icon={<PieChart className="text-indigo-400" size={20} />} label="Pipeline Total" value={`$${(totalPipeline/1000).toFixed(1)}k`} />
        <FinMetric icon={<CheckCircle2 className="text-emerald-400" size={20} />} label="Cobrado" value={`$${totalPaid.toLocaleString()}`} color="text-emerald-400" />
        <FinMetric icon={<Clock className="text-amber-400" size={20} />} label="Pendiente" value={`$${totalPending.toLocaleString()}`} color="text-amber-400" />
        <FinMetric icon={<AlertTriangle className="text-red-400" size={20} />} label="Vencido" value={`$${totalOverdue.toLocaleString()}`} color="text-red-400" />
      </div>

      {/* Cash Flow Chart */}
      <div className="bg-[#0a1120] border border-white/5 rounded-3xl p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h4 className="text-white font-bold text-lg">Flujo de Caja - Q2 2026</h4>
            <p className="text-slate-500 text-xs">Ingresos reales vs. proyectados</p>
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-2 text-[10px] text-slate-500"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Real</div>
            <div className="flex items-center gap-2 text-[10px] text-slate-500"><div className="w-2 h-2 rounded-full bg-indigo-500/50" /> Proyectado</div>
          </div>
        </div>
        <div className="h-48 flex items-end justify-between gap-3 px-2">
          {[
            { month: 'Ene', real: 30, proj: 40 },
            { month: 'Feb', real: 55, proj: 50 },
            { month: 'Mar', real: 45, proj: 60 },
            { month: 'Abr', real: 70, proj: 65 },
          ].map((m, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className="w-full flex gap-1 items-end justify-center" style={{ height: '160px' }}>
                <div className="w-6 bg-emerald-500/20 rounded-t-md transition-all hover:bg-emerald-500/40" style={{ height: `${m.real}%` }} />
                <div className="w-6 bg-indigo-500/10 rounded-t-md border border-indigo-500/20" style={{ height: `${m.proj}%` }} />
              </div>
              <span className="text-[10px] text-slate-600 font-bold mt-2">{m.month}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Invoice Table */}
      <div className="bg-[#0a1120] border border-white/5 rounded-3xl overflow-hidden">
        <div className="p-6 border-b border-white/5 flex justify-between items-center">
          <h4 className="text-white font-bold flex items-center gap-2"><CreditCard size={16} className="text-slate-500" /> Facturas Emitidas</h4>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all">+ Nueva Factura</button>
        </div>
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">N° Factura</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Cliente</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Monto</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Vencimiento</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Estado</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {INITIAL_INVOICES.map((inv) => (
              <tr key={inv.id} className="hover:bg-white/[0.01] transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center gap-3">
                    <FileText size={16} className="text-slate-600 group-hover:text-indigo-400 transition-colors" />
                    <span className="text-sm font-bold text-white font-mono">{inv.number}</span>
                  </div>
                </td>
                <td className="px-6 py-5 text-sm text-slate-300">{inv.clientName}</td>
                <td className="px-6 py-5 text-right font-mono text-sm font-bold text-white">${inv.amount.toLocaleString()}</td>
                <td className="px-6 py-5 text-center text-xs text-slate-500">{inv.dueDate}</td>
                <td className="px-6 py-5 text-center">
                  <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border ${
                    inv.status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                    inv.status === 'overdue' ? 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse' :
                    'bg-amber-500/10 text-amber-400 border-amber-500/20'
                  }`}>
                    {inv.status === 'paid' ? 'Pagado' : inv.status === 'overdue' ? 'Vencido' : 'Pendiente'}
                  </span>
                </td>
                <td className="px-6 py-5 text-right">
                  <button className="text-slate-600 hover:text-white transition-colors"><MoreVertical size={16} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const FinMetric: React.FC<{ icon: React.ReactNode; label: string; value: string; color?: string }> = ({ icon, label, value, color }) => (
  <div className="bg-white/[0.02] border border-white/5 rounded-3xl p-6 hover:bg-white/[0.04] transition-all">
    <div className="w-12 h-12 rounded-2xl bg-[#0a1120] flex items-center justify-center border border-white/5 mb-4">{icon}</div>
    <p className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-1">{label}</p>
    <h3 className={`text-2xl font-bold tracking-tight ${color || 'text-white'}`}>{value}</h3>
  </div>
);
