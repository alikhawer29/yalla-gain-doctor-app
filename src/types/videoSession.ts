export type BookingVideoSession = {
  status: 'waiting' | 'started' | 'ended';
  session_name?: string;
  sdk_key?: string;
  scheduled_start_at?: string | null;
  scheduled_end_at?: string | null;
  duration_minutes?: number | null;
  started_at?: string | null;
  can_start: boolean;
  can_end: boolean;
};
