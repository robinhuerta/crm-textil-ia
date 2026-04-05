import React, { useState } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import { arrayMove, sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { Deal, DealStage } from '../types';
import { STAGES, INITIAL_DEALS } from '../constants';
import { KanbanColumn } from './KanbanColumn';
import { KanbanCard } from './KanbanCard';
import { createPortal } from 'react-dom';
import '../styles/kanban.css';

export const KanbanBoard: React.FC = () => {
  const [deals, setDeals] = useState<Deal[]>(INITIAL_DEALS);
  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const deal = deals.find((d) => d.id === active.id);
    if (deal) setActiveDeal(deal);
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveADeal = active.data.current?.type === 'Deal' || true;
    const isOverADeal = over.data.current?.type === 'Deal' || true;

    // Lógica para mover entre columnas
    const activeDeal = deals.find((d) => d.id === activeId);
    if (!activeDeal) return;

    // Si pasamos sobre una columna
    const isOverAColumn = STAGES.some((s) => s.id === overId);
    
    if (isOverAColumn && activeDeal.stage !== overId) {
      setDeals((prev) => {
        const activeIndex = prev.findIndex((d) => d.id === activeId);
        prev[activeIndex].stage = overId as DealStage;
        return arrayMove(prev, activeIndex, activeIndex);
      });
      return;
    }

    // Si pasamos sobre otra tarjeta
    const overDeal = deals.find((d) => d.id === overId);
    if (overDeal && activeDeal.stage !== overDeal.stage) {
       setDeals((prev) => {
        const activeIndex = prev.findIndex((d) => d.id === activeId);
        prev[activeIndex].stage = overDeal.stage;
        return arrayMove(prev, activeIndex, activeIndex);
      });
    }
  };

  const onDragEnd = (event: DragEndEvent) => {
    setActiveDeal(null);
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    setDeals((prev) => {
      const activeIndex = prev.findIndex((d) => d.id === activeId);
      const overIndex = prev.findIndex((d) => d.id === overId);

      if (prev[activeIndex].stage !== prev[overIndex]?.stage && overIndex !== -1) {
        prev[activeIndex].stage = prev[overIndex].stage;
        return arrayMove(prev, activeIndex, overIndex);
      }

      return arrayMove(prev, activeIndex, overIndex);
    });
  };

  return (
    <div className="v-kanban-board no-scrollbar">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="flex gap-6 h-full">
          {STAGES.map((column) => (
            <KanbanColumn
              key={column.id}
              column={column}
              deals={deals.filter((d) => d.stage === column.id)}
            />
          ))}
        </div>

        {createPortal(
          <DragOverlay dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
              styles: {
                active: {
                  opacity: "0.5",
                },
              },
            }),
          }}>
            {activeDeal ? <KanbanCard deal={activeDeal} /> : null}
          </DragOverlay>,
          document.body
        )}
      </DndContext>
    </div>
  );
};
