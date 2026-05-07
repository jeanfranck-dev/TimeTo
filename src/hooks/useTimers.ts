import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import type { Timer, CreateTimerDTO, UpdateTimerDTO } from '../types';

export const useTimers = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // 1. FETCH Timers
  const { data: timers, isLoading } = useQuery({
    queryKey: ['timers', user?.id],
    queryFn: async (): Promise<Timer[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('timers')
        .select('*')
        .order('order_index', { ascending: true });

      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  // 2. CREATE Timer
  const createMutation = useMutation({
    mutationFn: async (newTimer: CreateTimerDTO) => {
      if (!user) throw new Error('Not authenticated');
      
      const { data, error } = await supabase
        .from('timers')
        .insert([{ 
          ...newTimer, 
          user_id: user.id,
          remaining_seconds: newTimer.duration_minutes * 60,
          last_used_date: new Date().toISOString()
        }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timers', user?.id] });
    },
  });

  // 3. UPDATE Timer
  const updateMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: UpdateTimerDTO }) => {
      const { data, error } = await supabase
        .from('timers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timers', user?.id] });
    },
  });

  // 4. DELETE Timer
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('timers').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['timers', user?.id] });
    },
  });

  // 5. REORDER Timers (Drag and Drop update)
  const reorderMutation = useMutation({
    mutationFn: async (updates: { id: string; order_index: number }[]) => {
      // Supabase no tiene un bulk update nativo simple por clave primaria en su SDK JS estándar sin usar RPC,
      // así que haremos múltiples promesas para simplificar en esta fase.
      const promises = updates.map((update) =>
        supabase.from('timers').update({ order_index: update.order_index }).eq('id', update.id)
      );
      await Promise.all(promises);
    },
    onMutate: async (updates) => {
      // Optimistic update
      await queryClient.cancelQueries({ queryKey: ['timers', user?.id] });
      const previousTimers = queryClient.getQueryData<Timer[]>(['timers', user?.id]);
      
      if (previousTimers) {
        const newTimers = [...previousTimers];
        updates.forEach(update => {
          const index = newTimers.findIndex(t => t.id === update.id);
          if (index !== -1) {
            newTimers[index] = { ...newTimers[index], order_index: update.order_index };
          }
        });
        // Sort before setting
        newTimers.sort((a, b) => a.order_index - b.order_index);
        queryClient.setQueryData(['timers', user?.id], newTimers);
      }
      return { previousTimers };
    },
    onError: (_err, _newTodos, context) => {
      if (context?.previousTimers) {
        queryClient.setQueryData(['timers', user?.id], context.previousTimers);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['timers', user?.id] });
    },
  });

  // 6. LOG HISTORY (when a timer finishes)
  const logHistoryMutation = useMutation({
    mutationFn: async ({ timer_id, title, duration_completed, status }: { timer_id: string; title: string; duration_completed: number; status: 'completed' | 'paused' | 'abandoned' }) => {
      if (!user) throw new Error('Not authenticated');
      const { error } = await supabase.from('history').insert([{
        user_id: user.id,
        timer_id,
        title,
        duration_completed,
        status,
      }]);
      if (error) throw error;
    },
  });

  return {
    timers,
    isLoading,
    createTimer: createMutation.mutateAsync,
    updateTimer: updateMutation.mutateAsync,
    deleteTimer: deleteMutation.mutateAsync,
    reorderTimers: reorderMutation.mutateAsync,
    logHistory: logHistoryMutation.mutateAsync,
  };
};
