import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent } from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { TimerItem } from './TimerItem';
import { useTimers } from '../../hooks/useTimers';
import type { Timer } from '../../types';
import { useState, useEffect } from 'react';

interface TimerListProps {
  onStart: (timer: Timer) => void;
}

export const TimerList = ({ onStart }: TimerListProps) => {
  const { timers, isLoading, updateTimer, deleteTimer, reorderTimers } = useTimers();
  const [localTimers, setLocalTimers] = useState<Timer[]>([]);

  useEffect(() => {
    if (timers) setLocalTimers(timers);
  }, [timers]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setLocalTimers((items) => {
        const oldIndex = items.findIndex((i) => i.id === active.id);
        const newIndex = items.findIndex((i) => i.id === over.id);
        
        const newArray = arrayMove(items, oldIndex, newIndex);
        
        // Prepare bulk update array for Supabase
        const updates = newArray.map((item, index) => ({
          id: item.id,
          order_index: index,
        }));
        
        // Trigger mutation in background
        reorderTimers(updates);
        
        return newArray;
      });
    }
  };

  const handleUpdateColor = async (id: string, color: string) => {
    await updateTimer({ id, updates: { color } });
  };

  if (isLoading) {
    return <div className="text-center py-10 text-slate-500">Loading timers...</div>;
  }

  if (localTimers.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 p-12 text-center dark:border-slate-800">
        <h3 className="mt-2 text-sm font-semibold text-slate-900 dark:text-white">No timers yet</h3>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Create a new timer above to get started.
        </p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-3">
        <SortableContext
          items={localTimers.map((t) => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {localTimers.map((timer) => (
            <TimerItem 
              key={timer.id} 
              timer={timer} 
              onDelete={(id) => deleteTimer(id)}
              onUpdateColor={handleUpdateColor}
              onStart={onStart}
            />
          ))}
        </SortableContext>
      </div>
    </DndContext>
  );
};
