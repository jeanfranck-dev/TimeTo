import { useAnalytics } from '../../hooks/useAnalytics';
import { Target, Clock, Activity, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export const AnalyticsWidgets = () => {
  const { history, stats, isLoading, clearHistory } = useAnalytics();

  if (isLoading) return <div className="animate-pulse h-32 bg-slate-100 dark:bg-slate-800 rounded-2xl w-full"></div>;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Accuracy Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
            <Target size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Accuracy</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stats.accuracy}%</h3>
          </div>
        </div>

        {/* Average Focus Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
            <Clock size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Average Focus</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stats.averageMinutes}m</h3>
          </div>
        </div>

        {/* Total Sessions Card */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-purple-100 text-purple-600 dark:bg-purple-900/30 dark:text-purple-400">
            <Activity size={28} />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Completed</p>
            <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{stats.completedSessions}</h3>
          </div>
        </div>
      </div>

      {/* History List */}
      {history && history.length > 0 && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
          <div className="flex items-center justify-between p-6 border-b border-slate-200 dark:border-slate-800">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">Recent History</h3>
            <button 
              onClick={() => {
                if (window.confirm('¿Estás seguro de que deseas eliminar todo el historial? Esto reseteará tus analíticas.')) {
                  clearHistory();
                }
              }}
              className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20 transition-colors"
            >
              <Trash2 size={16} />
              Clear All
            </button>
          </div>

          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {history.slice(0, 5).map((record) => (
              <div key={record.id} className="p-4 px-6 flex items-center justify-between">
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">{record.title}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    {formatDistanceToNow(new Date(record.completed_at), { addSuffix: true })}
                  </p>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                  record.status === 'completed' 
                    ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' 
                    : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                }`}>
                  {record.status.toUpperCase()} ({record.duration_completed}m)
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
