export interface Timer {
  id: string;
  user_id: string;
  title: string;
  duration_minutes: number;
  color: string;
  order_index: number;
  remaining_seconds?: number;
  last_used_date?: string;
  created_at?: string;
  updated_at?: string;
}

// Para usar al crear uno nuevo
export type CreateTimerDTO = Omit<Timer, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'remaining_seconds' | 'last_used_date'>;

// Para actualizar (ahora sí permitimos actualizar remaining_seconds y last_used_date)
export type UpdateTimerDTO = Partial<Omit<Timer, 'id' | 'user_id' | 'created_at' | 'updated_at'>>;
