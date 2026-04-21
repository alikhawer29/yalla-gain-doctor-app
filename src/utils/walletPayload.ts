/**
 * Normalized wallet payload from `GET wallet` (may be root or nested under `data`).
 * Matches backend fields such as `available_balance` in AED.
 */
export type WalletPayload = {
  status?: boolean;
  my_coins?: string | number;
  coin_amount?: string | number;
  available_balance?: number | string;
  pending_balance?: number | string;
  net_balance?: number | string;
  balance_currency?: string;
};

export function pickWalletPayload(raw: unknown): WalletPayload | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  const inner = r.data;
  if (inner && typeof inner === 'object') return inner as WalletPayload;
  return r as WalletPayload;
}

/** Prefer API `available_balance`; otherwise derive from coins × coin_amount. */
export function getAvailableBalanceAed(wallet: WalletPayload | null): number {
  if (!wallet) return 0;
  const ab = wallet.available_balance;
  if (ab != null && ab !== '') {
    const n = Number(ab);
    return Number.isFinite(n) ? n : 0;
  }
  const coins = Number(wallet.my_coins ?? 0) || 0;
  const rate = Number(wallet.coin_amount ?? 1) || 1;
  return coins * rate;
}
