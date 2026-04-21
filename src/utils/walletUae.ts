import type { UaeBeneficiary, UaeTransactionLogItem } from '../redux/Apis/User';

/** Mask IBAN for display using last 4 digits when available. */
export const maskIban = (iban?: string | null, ibanLast4?: string | null): string => {
  const last =
    (ibanLast4 && String(ibanLast4).replace(/\D/g, '').slice(-4)) ||
    (iban ? String(iban).replace(/\s/g, '').slice(-4) : '');
  if (!last) return '—';
  return `****${last}`;
};

/** UAE IBAN: AE + 21 digits (23 chars) after normalizing spaces. */
export const isValidUaeIban = (raw: string): boolean => {
  const s = raw.replace(/\s/g, '').toUpperCase();
  return /^AE\d{21}$/.test(s);
};

export const normalizeIbanInput = (raw: string): string => raw.replace(/\s/g, '').toUpperCase();

/** Normalize GET /stripe/uae/beneficiaries response shapes. */
export const parseUaeBeneficiariesList = (raw: unknown): UaeBeneficiary[] => {
  if (!raw || typeof raw !== 'object') return [];
  const r = raw as Record<string, unknown>;
  const d = r.data;
  if (Array.isArray(d)) return d as UaeBeneficiary[];
  if (d && typeof d === 'object') {
    const o = d as Record<string, unknown>;
    if (Array.isArray(o.data)) return o.data as UaeBeneficiary[];
    if (Array.isArray(o.beneficiaries)) return o.beneficiaries as UaeBeneficiary[];
  }
  if (Array.isArray(r.beneficiaries)) return r.beneficiaries as UaeBeneficiary[];
  return [];
};

type TxPagination = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  data: UaeTransactionLogItem[];
};

const metaToPagination = (
  list: UaeTransactionLogItem[],
  meta: unknown,
): TxPagination => {
  if (meta && typeof meta === 'object') {
    const m = meta as Record<string, unknown>;
    const totalN = Number(m.total);
    return {
      current_page: Number(m.current_page) || 1,
      last_page: Number(m.last_page) || 1,
      per_page: Number(m.per_page) || list.length || 15,
      total: Number.isFinite(totalN) ? totalN : list.length,
      data: list,
    };
  }
  return {
    current_page: 1,
    last_page: 1,
    per_page: list.length || 15,
    total: list.length,
    data: list,
  };
};

export const parseUaeTransactionLogsPage = (
  raw: unknown,
): { list: UaeTransactionLogItem[]; pagination: TxPagination | null } => {
  if (!raw || typeof raw !== 'object') return { list: [], pagination: null };
  const r = raw as Record<string, unknown>;
  const d = r.data;
  const meta = r.meta;

  /** Laravel-style: `data` is the array, pagination in `meta` */
  if (Array.isArray(d)) {
    const list = d as UaeTransactionLogItem[];
    return { list, pagination: metaToPagination(list, meta) };
  }

  if (d && typeof d === 'object') {
    const o = d as Record<string, unknown>;
    const tl = o.transaction_logs;
    if (tl && typeof tl === 'object' && Array.isArray((tl as TxPagination).data)) {
      const p = tl as TxPagination;
      return { list: p.data, pagination: p };
    }
    if (Array.isArray(o.data)) {
      return {
        list: o.data as UaeTransactionLogItem[],
        pagination: meta ? metaToPagination(o.data as UaeTransactionLogItem[], meta) : null,
      };
    }
    if (Array.isArray(o.items)) {
      return {
        list: o.items as UaeTransactionLogItem[],
        pagination: meta ? metaToPagination(o.items as UaeTransactionLogItem[], meta) : null,
      };
    }
  }
  return { list: [], pagination: null };
};
