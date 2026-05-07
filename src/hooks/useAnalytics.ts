import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface HistoryRecord {
  id: string;
  timer_id: string;
  title: string;
  duration_completed: number;
  status: 'completed' | 'paused' | 'abandoned';
  completed_at: string;
}

export const useAnalytics = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: history, isLoading } = useQuery({
    queryKey: ['history', user?.id],
    queryFn: async (): Promise<HistoryRecord[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('history')
        .select('*')
        .order('completed_at', { ascending: false });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // Cálculos de estadísticas
  const totalSessions = history?.length || 0;
  const completedSessions = history?.filter(h => h.status === 'completed').length || 0;
  
  // Accuracy (Precisión % de éxito)
  const accuracy = totalSessions > 0 
    ? Math.round((completedSessions / totalSessions) * 100) 
    : 0;

  // Tiempo total enfocado
  const totalMinutes = history?.reduce((acc, curr) => acc + curr.duration_completed, 0) || 0;
  
  // Promedio (Minutos por sesión)
  const averageMinutes = completedSessions > 0 
    ? Math.round(totalMinutes / completedSessions) 
    : 0;

  const clearHistoryMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('history').delete().eq('user_id', user.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['history', user?.id] });
    },
  });

  return {
    history,
    isLoading,
    stats: {
      totalSessions,
      completedSessions,
      accuracy,
      totalMinutes,
      averageMinutes
    },
    clearHistory: clearHistoryMutation.mutateAsync
  };
};
