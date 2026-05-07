import { useState } from 'react';
import { AnalyticsWidgets } from '../components/analytics/AnalyticsWidgets';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { useTimers } from '../hooks/useTimers';

export const Calendar = () => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const startDate = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const { timers } = useTimers(); // Podemos usar los timers actuales como "objetivos" diarios

  const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startDate, i));

  return (
    <div className="space-y-8 pb-12">
      <header className="flex flex-col gap-1">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
          Analytics & Schedule
        </h1>
        <p className="text-slate-500 dark:text-slate-400">
          Track your progress and plan your week.
        </p>
      </header>

      {/* Secciones de Estadísticas Reales (Supabase) */}
      <section>
        <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Your Performance</h2>
        <AnalyticsWidgets />
      </section>

      {/* Calendario Simple (Agenda Semanal) */}
      <section className="pt-6">
        <h2 className="mb-4 text-xl font-bold text-slate-900 dark:text-white">Weekly Agenda</h2>
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="grid grid-cols-7 border-b border-slate-200 dark:border-slate-800">
            {weekDays.map(day => {
              const isSelected = isSameDay(day, selectedDate);
              const isToday = isSameDay(day, new Date());
              return (
                <button
                  key={day.toString()}
                  onClick={() => setSelectedDate(day)}
                  className={`p-4 flex flex-col items-center justify-center transition-colors hover:bg-slate-50 dark:hover:bg-slate-800/50 ${
                    isSelected ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                  }`}
                >
                  <span className={`text-xs font-semibold ${isSelected ? 'text-blue-600 dark:text-blue-400' : 'text-slate-500'}`}>
                    {format(day, 'EEE').toUpperCase()}
                  </span>
                  <span className={`mt-1 h-8 w-8 flex items-center justify-center rounded-full text-lg font-bold ${
                    isToday ? 'bg-blue-600 text-white' : 
                    isSelected ? 'text-blue-700 dark:text-blue-400' : 'text-slate-900 dark:text-white'
                  }`}>
                    {format(day, 'd')}
                  </span>
                </button>
              );
            })}
          </div>
          
          <div className="p-6 bg-slate-50 dark:bg-slate-950/50 min-h-[200px]">
            <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">
              Goals for {format(selectedDate, 'MMMM do, yyyy')}
            </h3>
            
            {/* Aquí simulamos que los timers activos son las tareas del día por simplicidad en esta fase */}
            {timers && timers.length > 0 ? (
              <div className="space-y-3">
                {timers.map(timer => (
                  <div key={timer.id} className="flex items-center gap-3 p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                    <div className="h-3 w-3 rounded-full" style={{ backgroundColor: timer.color }} />
                    <span className="font-medium text-slate-700 dark:text-slate-200">{timer.title}</span>
                    <span className="ml-auto text-xs font-bold text-slate-400">{timer.duration_minutes}m</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-slate-400">
                <p>No goals scheduled for this day.</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
