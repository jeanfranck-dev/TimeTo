import { useState } from 'react';
import { CreateTimer } from '../components/timers/CreateTimer';
import { TimerList } from '../components/timers/TimerList';
import { ActiveSessionModal } from '../components/timers/ActiveSessionModal';
import type { Timer } from '../types';

export const Dashboard = () => {
  const [activeTimer, setActiveTimer] = useState<Timer | null>(null);

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Focus
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          What are we working on today?
        </p>
      </header>

      <div>
        <CreateTimer />
        <TimerList onStart={(timer) => setActiveTimer(timer)} />
      </div>

      {activeTimer && (
        <ActiveSessionModal 
          timer={activeTimer} 
          onClose={() => setActiveTimer(null)} 
        />
      )}
    </div>
  );
};
