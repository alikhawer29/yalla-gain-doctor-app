/** Normalize Laravel Video SDK payload (nested or flat). */
export type VideoSessionCredentials = {
  session_token: string;
  session_name: string;
  role: number;
  expires_at?: string;
};

export function parseZoomVideoSession(
  payload: Record<string, unknown> | null | undefined,
): VideoSessionCredentials | null {
  if (!payload || typeof payload !== 'object') return null;

  const root =
    (payload.data as Record<string, unknown> | undefined) ?? payload;

  const session_token = String(
    root.session_token ?? root.token ?? root.sessionToken ?? '',
  ).trim();
  const session_name = String(
    root.session_name ?? root.sessionName ?? root.topic ?? '',
  ).trim();
  const roleRaw = root.role ?? root.role_type ?? 1;
  const role = Number(roleRaw);
  const expires_at = root.expires_at
    ? String(root.expires_at)
    : undefined;

  if (!session_token || !session_name) return null;

  return {
    session_token,
    session_name,
    role: Number.isFinite(role) ? role : 1,
    expires_at,
  };
}
