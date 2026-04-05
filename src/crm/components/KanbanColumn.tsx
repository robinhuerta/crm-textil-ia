import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Deal, Column } from '../../types';
import { KanbanCard } from './KanbanCard';
import { LayoutDashboard, MoreVertical } from 'lucide-react';

interface Props {
  column: Column;
  deals: Deal[];
}

export const KanbanColumn: React.FC<Props> = ({ column, deals }) => {
  const { setNodeRef } = useDroppable({ id: column.id });

  const totalValue = deals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <div className="v-kanban-column group/column overflow-hidden flex flex-col h-full">
      <div className="px-5 py-4 flex items-center justify-between border-b border-white/5 bg-white/[0.02]">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-500/20 flex items-center justify-center text-indigo-400 border border-indigo-500/20">
            <LayoutDashboard size={14} />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100 tracking-tight">{column.title}</h2>
            <p className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">
               {deals.length} {deals.length === 1 ? 'TRATO' : 'TRATOS'} · ${totalValue.toLocaleString()}
            </p>
          </div>
        </div>
        <button className="text-slate-600 hover:text-slate-400 transition-colors">
          <MoreVertical size={16} />
        </button>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto no-scrollbar p-1 pb-20 min-h-[500px]"
      >
        <SortableContext
          items={deals.map((d) => d.id)}
          strategy={verticalListSortingStrategy}
        >
          <div className="flex flex-col gap-1">
            {deals.map((deal) => (
              <KanbanCard key={deal.id} deal={deal} />
            ))}
          </div>
        </SortableContext>

        {deals.length === 0 && (
          <div className="flex flex-col items-center justify-center h-40 border-2 border-dashed border-white/5 m-4 rounded-xl opacity-20">
            <p className="text-xs text-slate-400">VACÍO</p>
          </div>
        )}
      </div>
    </div>
  );
};
