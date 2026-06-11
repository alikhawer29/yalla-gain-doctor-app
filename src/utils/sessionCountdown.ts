export type SessionTiming = {
  status?: 'waiting' | 'started' | 'ended' | null;
  started_at?: string | null;
  scheduled_end_at?: string | null;
  duration_minutes?: number | null;
  /** Booking slot fallback only before session starts (DD/MM/YYYY). */
  appointment_date?: string | null;
  appointment_end_time?: string | null;
};

function isSessionStarted(timing: SessionTiming): boolean {
  if (timing.started_at) return true;
  return timing.status?.toLowerCase() === 'started';
}

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
  const hasDuration = Number.isFinite(durationMin) && durationMin > 0;

  if (timing.started_at && hasDuration) {
    const startMs = Date.parse(timing.started_at);
    if (!Number.isNaN(startMs)) {
      return startMs + durationMin * 60 * 1000;
    }
  }

  if (timing.scheduled_end_at) {
    const scheduledEndMs = Date.parse(timing.scheduled_end_at);
    if (!Number.isNaN(scheduledEndMs)) {
      return scheduledEndMs;
    }
  }

  if (!isSessionStarted(timing)) {
    const bookingEndMs = parseBookingDateTime(
      timing.appointment_date,
      timing.appointment_end_time,
    );
    if (bookingEndMs != null) {
      return bookingEndMs;
    }
  }

  return null;
}

/** Remaining session seconds: end - now (step 3). */
export function getSessionRemainingSeconds(
  timing: SessionTiming | null | undefined,
): number {
  const endMs = getSessionEndMs(timing);
  if (endMs != null) {
    let remaining = Math.max(0, Math.floor((endMs - Date.now()) / 1000));

    const durationMin = Number(timing?.duration_minutes);
    if (
      timing?.started_at &&
      Number.isFinite(durationMin) &&
      durationMin > 0
    ) {
      const maxRemaining = Math.floor(durationMin * 60);
      remaining = Math.min(remaining, maxRemaining);
    }

    return remaining;
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
    scheduled_end_at:
      source?.scheduled_end_at ?? bookingSession?.scheduled_end_at ?? null,
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

  if (timing.started_at && Number.isFinite(durationMin) && durationMin > 0) {
    return true;
  }

  if (timing.scheduled_end_at) {
    return true;
  }

  if (!isSessionStarted(timing) && timing.appointment_date && timing.appointment_end_time) {
    return true;
  }

  return Number.isFinite(durationMin) && durationMin > 0;
}
