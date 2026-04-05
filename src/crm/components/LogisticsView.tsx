import React from 'react';
import { Shipment } from '../../types';
import { INITIAL_SHIPMENTS } from '../../constants';
import { 
  Truck, 
  Anchor, 
  Globe, 
  MapPin, 
  Calendar, 
  FileText, 
  ArrowRight,
  ExternalLink,
  ChevronRight,
  Zap,
  Clock
} from 'lucide-react';

export const LogisticsView: React.FC = () => {
  return (
    <div className="p-8 animate-fadeIn max-w-7xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
           <h2 className="text-2xl font-bold text-white tracking-tight">Rastreo de Importaciones</h2>
           <p className="text-slate-400 text-sm">Monitoreo en tiempo real de maquinaria y lotes de repuestos desde origen.</p>
        </div>
        <div className="flex items-center gap-4 bg-white/5 px-4 py-2 rounded-xl border border-white/5">
           <Zap size={16} className="text-amber-400" />
           <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-none">
             Partner: Base44 Logistics Hub
           </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {INITIAL_SHIPMENTS.map((shipment) => (
          <div key={shipment.id} className="bg-[#0a1120] border border-white/5 rounded-3xl overflow-hidden shadow-2xl flex flex-col group">
            {/* Header / Status Bar */}
            <div className="p-6 border-b border-white/5 bg-white/[0.01] flex justify-between items-center">
              <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                    <Truck size={24} />
                 </div>
                 <div>
                    <h3 className="text-lg font-bold text-white group-hover:text-indigo-400 transition-colors leading-none mb-1">{shipment.productName}</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">ID Seguimiento: {shipment.id} | Barco: {shipment.vesselName || 'N/A'}</p>
                 </div>
              </div>
              <div className="flex items-center gap-6">
                 <div className="text-right">
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">ETA Estimada</p>
                    <p className="text-sm font-bold text-amber-400">{shipment.eta}</p>
                 </div>
                 <div className={`px-4 py-1.5 rounded-full border text-[10px] font-black uppercase tracking-widest ${
                   shipment.status === 'customs' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20 shadow-lg shadow-amber-500/10' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                 }`}>
                   {shipment.status === 'in_transit' ? 'En Tránsito' : shipment.status === 'customs' ? 'En Aduanas' : 'Entregado'}
                 </div>
              </div>
            </div>

            {/* Content Body */}
            <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-12 relative overflow-hidden">
               {/* Step-by-step connection */}
               <div className="absolute top-1/2 left-0 right-0 h-px bg-white/5 hidden lg:block" />

               <div className="relative z-10 flex flex-col items-center lg:items-start text-center lg:text-left space-y-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 border border-white/5 shadow-inner">
                     <Globe size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Origen</p>
                    <p className="text-sm font-bold text-white leading-tight">{shipment.origin}</p>
                  </div>
               </div>

               <div className="relative z-10 flex flex-col items-center text-center space-y-4">
                  <div className="px-4 py-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-2 text-indigo-400 shadow-xl shadow-indigo-500/5">
                     <MapPin size={14} className="animate-bounce" />
                     <span className="text-[10px] font-bold uppercase tracking-widest">Ubicación Actual</span>
                  </div>
                  <p className="text-sm font-black text-slate-300 italic group-hover:text-white transition-colors">{shipment.currentLocation}</p>
               </div>

               <div className="relative z-10 flex flex-col items-center lg:items-end text-center lg:text-right space-y-4">
                  <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-slate-400 border border-white/5 shadow-inner leading-tight">
                     <Anchor size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Destino</p>
                    <p className="text-sm font-bold text-white leading-tight">{shipment.destination}</p>
                  </div>
               </div>
            </div>

            {/* Footer / Documents */}
            <div className="p-6 border-t border-white/5 bg-white/[0.01] flex justify-between items-center">
               <div className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Documentación:</span>
                  <div className="flex gap-2">
                    {shipment.documents.map((doc, i) => (
                      <button key={i} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 text-slate-400 px-3 py-1 rounded-lg text-[10px] font-bold border border-white/5 transition-all">
                        <FileText size={12} />
                        {doc.name}
                      </button>
                    ))}
                  </div>
               </div>
               <button className="text-indigo-400 text-xs font-bold flex items-center gap-2 group-hover:underline">
                  Ver Trato Asociado
                  <ArrowRight size={14} />
               </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
