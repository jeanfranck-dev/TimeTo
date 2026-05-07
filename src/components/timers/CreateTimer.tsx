import { useState } from 'react';
import { useTimers } from '../../hooks/useTimers';
import { Plus } from 'lucide-react';

export const CreateTimer = () => {
  const { createTimer, timers } = useTimers();
  const [title, setTitle] = useState('');
  const [duration, setDuration] = useState(25);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createTimer({
      title: title.trim(),
      duration_minutes: duration,
      color: '#3B82F6', // Default blue
      order_index: timers ? timers.length : 0,
    });

    setTitle('');
    setDuration(25);
  };

  return (
    <form onSubmit={handleSubmit} className="mb-8 flex items-center gap-4 bg-white dark:bg-slate-900 p-2 pl-4 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800">
      <input
        type="text"
        placeholder="What do you want to focus on?"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="flex-1 bg-transparent border-none outline-none text-slate-900 dark:text-white placeholder:text-slate-400"
        required
      />
      
      <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-4">
        <input
          type="number"
          min="1"
          max="120"
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
          className="w-16 bg-transparent text-center font-medium outline-none text-slate-900 dark:text-white"
          required
        />
        <span className="text-sm text-slate-500 mr-2">min</span>
        
        <button
          type="submit"
          className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white transition-transform hover:scale-105 active:scale-95 shadow-md shadow-blue-500/20"
        >
          <Plus size={20} />
        </button>
      </div>
    </form>
  );
};
