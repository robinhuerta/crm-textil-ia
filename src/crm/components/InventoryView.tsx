import React from 'react';
import { InventoryItem } from '../../types';
import { INITIAL_INVENTORY } from '../../constants';
import { 
  Package, 
  AlertTriangle, 
  Plus, 
  Search, 
  Filter,
  ArrowUpDown,
  ShoppingBag,
  MoreVertical
} from 'lucide-react';

export const InventoryView: React.FC = () => {
  return (
    <div className="p-8 animate-fadeIn max-w-7xl mx-auto">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Inventario de Suministros</h2>
          <p className="text-slate-400 text-sm">Control de agujas, aceites y repuestos críticos para la producción.</p>
        </div>
        <div className="flex gap-3">
          <button className="bg-white/5 hover:bg-white/10 text-slate-300 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border border-white/5 flex items-center gap-2">
            <ShoppingBag size={18} />
            Orden de Compra
          </button>
          <button className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-lg shadow-indigo-500/20 flex items-center gap-2">
            <Plus size={18} />
            Nuevo Ítem
          </button>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-[#0a1120] border border-white/5 rounded-2xl p-4 mb-6 flex gap-4 items-center">
        <div className="flex-1 relative">
           <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
           <input 
             type="text" 
             placeholder="Buscar por SKU o nombre..."
             className="w-full bg-white/5 border border-white/5 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-300 focus:border-indigo-500/50 outline-none transition-all"
           />
        </div>
        <button className="p-2.5 bg-white/5 rounded-xl text-slate-500 hover:text-white transition-all border border-white/5">
           <Filter size={18} />
        </button>
      </div>

      {/* Inventory Table */}
      <div className="bg-[#0a1120] border border-white/5 rounded-3xl overflow-hidden shadow-2xl">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Producto / SKU</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Categoría</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Stock Actual</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Estado</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Precio Unit.</th>
              <th className="px-6 py-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {INITIAL_INVENTORY.map((item) => {
              const isLowStock = item.stock < item.minStock;
              return (
                <tr key={item.id} className="hover:bg-white/[0.01] transition-colors group">
                  <td className="px-6 py-5">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500/10 group-hover:text-indigo-400 transition-all">
                        <Package size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white leading-none mb-1">{item.name}</p>
                        <p className="text-[10px] font-mono text-slate-500 tracking-wider uppercase">{item.sku}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-5">
                    <span className="text-[10px] font-bold text-slate-400 bg-white/5 px-2 py-1 rounded-full border border-white/5 uppercase tracking-widest">
                      {item.category}
                    </span>
                  </td>
                  <td className="px-6 py-5 text-center">
                    <p className={`text-sm font-bold ${isLowStock ? 'text-amber-400' : 'text-slate-300'}`}>
                      {item.stock} <span className="text-[10px] font-normal text-slate-500">{item.unit}</span>
                    </p>
                  </td>
                  <td className="px-6 py-5 text-center">
                    {isLowStock ? (
                      <div className="flex items-center justify-center gap-2 text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 w-fit mx-auto animate-pulse">
                        <AlertTriangle size={12} />
                        <span className="text-[9px] font-black uppercase tracking-widest">STOCK BAJO</span>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2 text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20 w-fit mx-auto">
                        <span className="text-[9px] font-black uppercase tracking-widest">ÓPTIMO</span>
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-5 text-right font-mono text-sm text-slate-400">
                    ${item.price.toFixed(2)}
                  </td>
                  <td className="px-6 py-5 text-right">
                    <button className="text-slate-600 hover:text-white transition-colors">
                      <MoreVertical size={18} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
