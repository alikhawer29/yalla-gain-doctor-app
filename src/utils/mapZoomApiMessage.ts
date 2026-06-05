/** Map Laravel zoom/booking API messages to doctor-facing copy. */
export function mapZoomApiMessage(message: unknown): string {
  const raw = typeof message === 'string' ? message.trim() : '';
  if (!raw) {
    return 'Something went wrong. Please try again.';
  }

  const m = raw.toLowerCase();

  if (m.includes('session not started yet')) {
    return 'Appointment time has not arrived yet. You can start within 10 minutes before the scheduled slot.';
  }
  if (m.includes('session has ended')) {
    return 'This session window has ended or the meeting was already ended.';
  }
  if (m.includes('booking is not confirmed')) {
    return 'This booking is not confirmed yet.';
  }
  if (m.includes('booking is cancelled')) {
    return 'This booking was cancelled.';
  }
  if (m.includes('forbidden')) {
    return 'This appointment is not assigned to you.';
  }
  if (m.includes('video session is not configured')) {
    return 'Video session is not set up for this booking.';
  }
  if (m.includes('session has not been started yet')) {
    return 'Start the session first before ending it.';
  }
  if (m.includes('session already ended')) {
    return 'This meeting has already ended.';
  }
  if (m.includes('zoom video sdk credentials are missing')) {
    return 'Video calling is temporarily unavailable. Please contact support.';
  }
  if (m.includes('no query results for model')) {
    return 'Booking not found.';
  }

  return raw;
}
