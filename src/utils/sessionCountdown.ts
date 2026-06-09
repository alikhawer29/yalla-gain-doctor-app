export type SessionTiming = {
  status?: 'waiting' | 'started' | 'ended' | null;
  started_at?: string | null;
  duration_minutes?: number | null;
  /** Booking slot fallback when session not started yet (DD/MM/YYYY). */
  appointment_date?: string | null;
  appointment_end_time?: string | null;
};

function parseBookingDateTime(
  date?: string | null,
  time?: string | null,
): number | null {
  if (!date?.trim() || !time?.trim()) return null;

  const dateParts = date.trim().split('/');
  if (dateParts.length !== 3) return null;

  const day = Number(dateParts[0]);
  const month = Number(dateParts[1]);
  const year = Number(dateParts[2]);
  const timeParts = time.trim().split(':');
  const hours = Number(timeParts[0] ?? 0);
  const minutes = Number(timeParts[1] ?? 0);
  const seconds = Number(timeParts[2] ?? 0);

  if (
    !Number.isFinite(day) ||
    !Number.isFinite(month) ||
    !Number.isFinite(year) ||
    !Number.isFinite(hours) ||
    !Number.isFinite(minutes)
  ) {
    return null;
  }

  const endMs = new Date(
    year,
    month - 1,
    day,
    hours,
    minutes,
    Number.isFinite(seconds) ? seconds : 0,
  ).getTime();

  return Number.isNaN(endMs) ? null : endMs;
}

/** Session end timestamp (ms) from API — never Zoom SDK. */
export function getSessionEndMs(
  timing: SessionTiming | null | undefined,
): number | null {
  if (!timing) return null;

  const durationMin = Number(timing.duration_minutes);

  if (
    timing.status === 'started' &&
    timing.started_at &&
    Number.isFinite(durationMin) &&
    durationMin > 0
  ) {
    const startMs = Date.parse(timing.started_at);
    if (!Number.isNaN(startMs)) {
      return startMs + durationMin * 60 * 1000;
    }
  }

  const bookingEndMs = parseBookingDateTime(
    timing.appointment_date,
    timing.appointment_end_time,
  );
  if (bookingEndMs != null) {
    return bookingEndMs;
  }

  return null;
}

/** Remaining session seconds: end - now (step 3). */
export function getSessionRemainingSeconds(
  timing: SessionTiming | null | undefined,
): number {
  const endMs = getSessionEndMs(timing);
  if (endMs != null) {
    return Math.max(0, Math.floor((endMs - Date.now()) / 1000));
  }

  const durationMin = Number(timing?.duration_minutes);
  if (Number.isFinite(durationMin) && durationMin > 0) {
    return Math.floor(durationMin * 60);
  }

  return 0;
}

export function formatSessionCountdown(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const sec = s % 60;

  if (h > 0) {
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  return `${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
}

export function pickSessionTiming(
  bookingSession?: SessionTiming | null,
  startPayload?: Record<string, unknown> | null,
  booking?: {
    appointment_date?: string | null;
    appointment_end_time?: string | null;
  } | null,
): SessionTiming {
  const nested = startPayload?.video_session as SessionTiming | undefined;
  const source = nested ?? (startPayload as SessionTiming | undefined);

  return {
    status: (source?.status ?? bookingSession?.status) as SessionTiming['status'],
    started_at: source?.started_at ?? bookingSession?.started_at ?? null,
    duration_minutes:
      source?.duration_minutes ?? bookingSession?.duration_minutes ?? null,
    appointment_date: booking?.appointment_date ?? null,
    appointment_end_time: booking?.appointment_end_time ?? null,
  };
}

export function hasSessionCountdown(
  timing: SessionTiming | null | undefined,
): boolean {
  if (!timing) return false;

  const durationMin = Number(timing.duration_minutes);

  if (
    timing.status === 'started' &&
    timing.started_at &&
    Number.isFinite(durationMin) &&
    durationMin > 0
  ) {
    return true;
  }

  if (timing.appointment_date && timing.appointment_end_time) {
    return true;
  }

  return Number.isFinite(durationMin) && durationMin > 0;
}
