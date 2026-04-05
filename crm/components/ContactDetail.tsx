import React, { useState } from 'react';
import { Contact } from '../types';
import { 
  X, 
  Phone, 
  Mail, 
  MessageSquare, 
  ChevronRight, 
  Clock, 
  Zap, 
  Cpu, 
  FileText,
  AlertCircle,
  CheckCircle2,
  Settings2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface Props {
  contact: Contact;
  onClose: () => void;
}

export const ContactDetail: React.FC<Props> = ({ contact, onClose }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'machinery' | 'history'>('overview');

  return (
    <motion.div 
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      className="fixed inset-y-0 right-0 w-full max-w-xl bg-[#0a0f19] border-l border-white/10 shadow-2xl z-[300] flex flex-col"
    >
      {/* Header */}
      <div className="p-8 border-b border-white/5 bg-gradient-to-br from-[#0f172a] to-[#0a0f19]">
        <div className="flex justify-between items-start mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center font-black text-2xl text-white shadow-xl shadow-indigo-500/20">
            {contact.avatar}
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-white/10 hover:text-white transition-all border border-white/5"
          >
            <X size={20} />
          </button>
        </div>

        <h2 className="text-2xl font-bold text-white mb-1 tracking-tight">{contact.name}</h2>
        <p className="text-indigo-400 font-semibold text-sm mb-6 flex items-center gap-2">
          {contact.role} en <span className="text-white">{contact.companyName}</span>
        </p>

        <div className="flex gap-3">
          <QuickAction icon={<Phone size={18} />} label="Llamar" color="bg-emerald-500/10 text-emerald-400 border-emerald-500/20" />
          <QuickAction icon={<Mail size={18} />} label="Correo" color="bg-blue-500/10 text-blue-400 border-blue-500/20" />
          <QuickAction icon={<MessageSquare size={18} />} label="WhatsApp" color="bg-green-500/10 text-green-400 border-green-500/20" />
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex px-8 border-b border-white/5 bg-white/[0.01]">
        <TabButton active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} label="Resumen" icon={<Zap size={14} />} />
        <TabButton active={activeTab === 'machinery'} onClick={() => setActiveTab('machinery')} label="Maquinaria" icon={<Cpu size={14} />} />
        <TabButton active={activeTab === 'history'} onClick={() => setActiveTab('history')} label="Actividad" icon={<Clock size={14} />} />
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-8 space-y-8 no-scrollbar">
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-fadeIn">
            {/* AI Summary Card */}
            <div className="bg-indigo-500/5 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <SparkleIcon />
              </div>
              <div className="flex items-center gap-2 text-indigo-400 mb-3 px-2 py-1 rounded-full bg-indigo-500/10 w-fit">
                <Zap size={14} />
                <span className="text-[10px] font-black uppercase tracking-widest">IA Smart Insights</span>
              </div>
              <p className="text-slate-200 text-sm leading-relaxed font-medium italic">
                "{contact.aiSummary}"
              </p>
            </div>

            <section>
              <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-4 px-1">Información de Contacto</h4>
              <div className="space-y-3">
                <InfoRow icon={<Mail size={14} />} label="Email Principal" value={contact.email} />
                <InfoRow icon={<Phone size={14} />} label="Teléfono Directo" value={contact.phone} />
                <InfoRow icon={<FileText size={14} />} label="CUIT/RUC" value="20601234567" />
              </div>
            </section>
          </div>
        )}

        {activeTab === 'machinery' && (
          <div className="space-y-4 animate-fadeIn">
            <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-4 px-1">Parque de Maquinaria Instalada</h4>
            {contact.machines.map((machine) => (
              <div key={machine.id} className="bg-white/5 border border-white/5 rounded-xl p-4 flex items-center justify-between group hover:bg-white/10 transition-all">
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${machine.status === 'down' ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-white/5 text-slate-400 border-white/5'}`}>
                    <Cpu size={18} />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-white">{machine.brand} {machine.model}</h5>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider">Año {machine.year} · SN: {machine.serialNumber || 'N/A'}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   {machine.status === 'operational' ? <CheckCircle2 size={14} className="text-emerald-500" /> : <AlertCircle size={14} className="text-red-500" />}
                   <span className={`text-[10px] font-bold uppercase ${machine.status === 'operational' ? 'text-emerald-500' : 'text-red-500'}`}>
                     {machine.status === 'operational' ? 'Operativo' : 'Requiere AT'}
                   </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-6 animate-fadeIn">
            <h4 className="text-[10px] uppercase font-black tracking-widest text-slate-500 mb-2 px-1">Línea de Tiempo</h4>
            <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-white/5">
              {contact.activities.map((activity) => (
                <div key={activity.id} className="relative pl-8">
                  <div className="absolute left-0 top-1 w-6 h-6 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 z-10">
                    <HistoryIcon type={activity.type} />
                  </div>
                  <div className="bg-white/[0.02] border border-white/5 rounded-xl p-3">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest">{activity.type}</span>
                      <span className="text-[10px] text-slate-600 font-medium">{activity.date}</span>
                    </div>
                    <p className="text-xs text-slate-300 leading-normal">{activity.content}</p>
                    <div className="mt-2 text-[9px] text-slate-500 flex items-center gap-1">
                       <span className="w-4 h-4 rounded-full bg-white/5 flex items-center justify-center text-[7px] font-bold">RH</span>
                       Gestionado por {activity.user}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-8 border-t border-white/5 bg-white/[0.02] flex gap-3">
        <button className="flex-1 bg-white/5 border border-white/10 hover:bg-white/10 text-white font-bold py-3 rounded-xl text-sm transition-all flex items-center justify-center gap-2">
          <FileText size={16} />
          Nueva Nota
        </button>
        <button className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2">
          <Settings2 size={16} />
          Gestionar Activos
        </button>
      </div>
    </motion.div>
  );
};

const QuickAction: React.FC<{ icon: React.ReactNode, label: string, color: string }> = ({ icon, label, color }) => (
  <button className={`flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-xl border transition-all hover:scale-105 ${color}`}>
    {icon}
    <span className="text-[9px] font-black uppercase tracking-widest mt-2">{label}</span>
  </button>
);

const TabButton: React.FC<{ active: boolean, onClick: () => void, label: string, icon: React.ReactNode }> = ({ active, onClick, label, icon }) => (
  <button 
    onClick={onClick}
    className={`flex items-center gap-2 px-6 py-4 border-b-2 transition-all text-xs font-bold ${active ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500 hover:text-slate-300'}`}
  >
    {icon}
    {label}
  </button>
);

const InfoRow: React.FC<{ icon: React.ReactNode, label: string, value: string }> = ({ icon, label, value }) => (
  <div className="flex items-center justify-between p-3 bg-white/[0.02] border border-white/5 rounded-xl">
    <div className="flex items-center gap-3">
      <div className="text-slate-600">{icon}</div>
      <span className="text-[10px] font-bold text-slate-500 uppercase">{label}</span>
    </div>
    <span className="text-xs font-medium text-slate-300">{value}</span>
  </div>
);

const HistoryIcon: React.FC<{ type: string }> = ({ type }) => {
  switch (type) {
    case 'call': return <Phone size={10} />;
    case 'email': return <Mail size={10} />;
    case 'meeting': return <UsersIcon size={10} />;
    case 'note': return <FileText size={10} />;
    case 'maintenance': return <Settings2 size={10} />;
    default: return <Clock size={10} />;
  }
};

const SparkleIcon = () => (
  <svg width="64" height="64" viewBox="0 0 24 24" fill="currentColor" className="text-indigo-500">
    <path d="M12 2L14.5 9H21.5L16 13.5L18.5 20.5L12 16L5.5 20.5L8 13.5L2.5 9H9.5L12 2Z" />
  </svg>
);

const UsersIcon = ({ size }: { size: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);
