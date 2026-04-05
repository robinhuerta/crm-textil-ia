import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Deal } from '../../types';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, Tag, Info } from 'lucide-react';

interface Props {
  deal: Deal;
}

export const KanbanCard: React.FC<Props> = ({ deal }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({ id: deal.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.3 : 1,
    zIndex: isDragging ? 10 : 1,
  };

  const priorityColors = {
    high: 'text-red-400',
    medium: 'text-amber-400',
    low: 'text-slate-400'
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="v-deal-card group"
    >
      <div className="flex justify-between items-start mb-3">
        <h3 className="text-white font-bold text-sm group-hover:text-amber-300 transition-colors">
          {deal.customerName}
        </h3>
        <span className={`text-[10px] uppercase font-black px-1.5 py-0.5 rounded-full bg-white/10 ${priorityColors[deal.priority]}`}>
          {deal.priority}
        </span>
      </div>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-300">
          <Tag size={12} className="text-amber-400/70" />
          <span>{deal.productName}</span>
        </div>

        {deal.machineryDetails && (
          <div className="flex items-center gap-2 text-[11px] text-slate-400 bg-black/20 p-1.5 rounded-md border border-white/5">
            <Info size={12} />
            <span>{deal.machineryDetails.brand} {deal.machineryDetails.model}</span>
          </div>
        )}

        {deal.logisticsStatus && (
          <div className="mt-1 text-[10px] text-blue-300 flex items-center gap-1">
             <div className="w-1 h-1 rounded-full bg-blue-400 animate-pulse" />
             {deal.logisticsStatus}
          </div>
        )}

        <div className="flex justify-between items-center pt-3 mt-2 border-t border-white/5">
          <div className="flex items-center gap-1 text-slate-200 font-bold text-xs">
            <DollarSign size={12} className="text-emerald-400" />
            {deal.value.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
          </div>
          <div className="flex items-center gap-1 text-[10px] text-slate-500">
            <Calendar size={10} />
            {deal.lastActivity}
          </div>
        </div>
      </div>
    </div>
  );
};
