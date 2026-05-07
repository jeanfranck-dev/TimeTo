export interface Timer {
  id: string;
  user_id: string;
  title: string;
  duration_minutes: number;
  color: string;
  order_index: number;
  created_at?: string;
  updated_at?: string;
}

// Para usar al crear uno nuevo
export type CreateTimerDTO = Omit<Timer, 'id' | 'user_id' | 'created_at' | 'updated_at'>;

export type UpdateTimerDTO = Partial<CreateTimerDTO>;
