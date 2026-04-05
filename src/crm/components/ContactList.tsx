import React from 'react';
import { Contact } from '../types';
import { INITIAL_CONTACTS } from '../constants';
import { 
  Search, 
  UserPlus, 
  MoreHorizontal, 
  Phone, 
  Mail, 
  ExternalLink,
  Briefcase,
  TrendingUp
} from 'lucide-react';

interface Props {
  onSelectContact: (contact: Contact) => void;
}

export const ContactList: React.FC<Props> = ({ onSelectContact }) => {
  return (
    <div className="p-8 animate-fadeIn">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Directorio de Contactos</h2>
          <p className="text-slate-400 text-sm">Gestiona tus relaciones clave y el parque de maquinaria de tus clientes.</p>
        </div>
        <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20">
          <UserPlus size={18} />
          Nuevo Contacto
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {INITIAL_CONTACTS.map((contact) => (
          <div 
            key={contact.id}
            onClick={() => onSelectContact(contact)}
            className="bg-white/[0.03] border border-white/5 rounded-2xl p-6 hover:bg-white/[0.05] transition-all cursor-pointer group hover:border-white/10"
          >
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-white/10 flex items-center justify-center font-bold text-indigo-400 text-lg">
                  {contact.avatar}
                </div>
                <div>
                  <h3 className="font-bold text-white group-hover:text-indigo-400 transition-colors">{contact.name}</h3>
                  <p className="text-xs text-slate-500 font-medium">{contact.role}</p>
                </div>
              </div>
              <button className="text-slate-600 hover:text-slate-400">
                <MoreHorizontal size={20} />
              </button>
            </div>

            <div className="space-y-3 mb-6">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <Briefcase size={14} className="text-slate-600" />
                <span className="font-semibold text-slate-300">{contact.companyName}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <Mail size={14} className="text-slate-600" />
                <span>{contact.email}</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <Phone size={14} className="text-slate-600" />
                <span>{contact.phone}</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-white/5">
              <div className="bg-white/5 p-2 rounded-lg text-center">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Tratos</p>
                <div className="flex items-center justify-center gap-1 text-slate-200">
                  <TrendingUp size={12} className="text-emerald-400" />
                  <span className="font-bold text-sm">{contact.dealCount}</span>
                </div>
              </div>
              <div className="bg-white/5 p-2 rounded-lg text-center">
                <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Valor Total</p>
                <p className="text-sm font-bold text-slate-200">${(contact.totalDealValue / 1000).toFixed(1)}k</p>
              </div>
            </div>

            <div className="mt-4 flex items-center justify-between">
               <span className="text-[10px] text-slate-500 italic">Última interacción: {contact.lastInteraction}</span>
               <button className="text-indigo-400 text-xs font-bold flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 Ver Ficha 360°
                 <ExternalLink size={12} />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
