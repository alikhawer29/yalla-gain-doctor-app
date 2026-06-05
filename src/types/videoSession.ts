export type BookingVideoSession = {
  status: 'waiting' | 'started' | 'ended';
  session_name?: string;
  sdk_key?: string;
  started_at?: string | null;
  can_start: boolean;
  can_end: boolean;
};
