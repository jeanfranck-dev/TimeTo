import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Timer } from '../../types';
import { GripVertical, Play, Trash2, CheckCircle2 } from 'lucide-react';
import { isSameDay } from 'date-fns';

interface TimerItemProps {
  timer: Timer;
  onDelete: (id: string) => void;
  onUpdateColor: (id: string, color: string) => void;
  onStart: (timer: Timer) => void;
}

export const TimerItem = ({ timer, onDelete, onUpdateColor, onStart }: TimerItemProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: timer.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 10 : 1,
    opacity: isDragging ? 0.8 : 1,
  };

  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  const timeLeftSeconds = (() => {
    if (timer.remaining_seconds === undefined || timer.remaining_seconds === null || !timer.last_used_date) {
      return timer.duration_minutes * 60;
    }
    if (!isSameDay(new Date(timer.last_used_date), new Date())) {
      return timer.duration_minutes * 60;
    }
    return timer.remaining_seconds;
  })();

  const timeLeftMinutes = Math.ceil(timeLeftSeconds / 60);
  const isPartiallyUsed = timeLeftSeconds < timer.duration_minutes * 60 && timeLeftSeconds > 0;
  const isCompleted = timeLeftSeconds === 0;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`group relative flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:bg-slate-900 border border-slate-200 dark:border-slate-800 ${
        isDragging ? 'shadow-lg ring-2 ring-blue-500' : ''
      } ${isCompleted ? 'opacity-60' : ''}`}
    >
      {/* Drag Handle */}
      <button
        {...attributes}
        {...listeners}
        className="cursor-grab text-slate-400 hover:text-slate-600 active:cursor-grabbing dark:text-slate-500 dark:hover:text-slate-300"
      >
        <GripVertical size={20} />
      </button>

      {/* Color Indicator */}
      <div 
        className="h-12 w-2 rounded-full" 
        style={{ backgroundColor: isCompleted ? '#94a3b8' : timer.color }}
      />

      {/* Info */}
      <div className="flex-1">
        <h3 className={`font-semibold text-lg ${isCompleted ? 'text-slate-500 line-through dark:text-slate-500' : 'text-slate-900 dark:text-white'}`}>
          {timer.title}
        </h3>
        <div className="flex items-center gap-2 mt-0.5">
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {timer.duration_minutes} min total
          </p>
          {isPartiallyUsed && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              {timeLeftMinutes}m left today
            </span>
          )}
          {isCompleted && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={12} />
              Done today
            </span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2">
        <div className="hidden group-hover:flex items-center gap-1 mr-2">
          {/* Quick Color Picker */}
          {colors.map(c => (
            <button
              key={c}
              onClick={() => onUpdateColor(timer.id, c)}
              className={`h-4 w-4 rounded-full transition-transform hover:scale-110 ${timer.color === c ? 'ring-2 ring-slate-400 ring-offset-1 dark:ring-offset-slate-900' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
        
        <button
          onClick={() => onDelete(timer.id)}
          className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
        >
          <Trash2 size={18} />
        </button>
        
        <button 
          onClick={() => onStart(timer)}
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600 transition-colors hover:bg-blue-100 hover:text-blue-600 dark:bg-slate-800 dark:text-slate-300 dark:hover:bg-blue-900/30 dark:hover:text-blue-400">
          <Play size={18} className="ml-1" fill="currentColor" />
        </button>
      </div>
    </div>
  );
};
