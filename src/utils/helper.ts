import { City, State } from 'country-state-city';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);
import {
  Dimensions,
  Insets,
  PixelRatio,
  Platform,
  StatusBar,
} from 'react-native';
import { initialWindowMetrics } from 'react-native-safe-area-context';
import colors from './colors';
import { getDeviceTimezone } from './device';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const widthBaseScale = SCREEN_WIDTH / 393;
const heightBaseScale = SCREEN_HEIGHT / 852;

function normalize(size: number, based = 'width') {
  const newSize =
    based === 'height' ? size * heightBaseScale : size * widthBaseScale;
  return Math.round(PixelRatio.roundToNearestPixel(newSize));
}

export const heightPixel = (size: number) => {
  return normalize(size, 'height');
};

export const widthPixel = (size: number) => {
  return normalize(size, 'width');
};

export const font = (size: number, factor = 1) => {
  return Math.round(
    PixelRatio.roundToNearestPixel(widthBaseScale * size * factor),
  );
};

export const STATUSBAR_HEIGHT =
  (Platform.OS === 'ios'
    ? initialWindowMetrics?.insets.top
    : StatusBar.currentHeight) || 0;

export const BOTTOMBAR_HEIGHT = initialWindowMetrics?.insets.bottom || 0;

export const vh = (SCREEN_HEIGHT - STATUSBAR_HEIGHT) * 0.01;
export const vw = SCREEN_WIDTH * 0.01;

export const HEADER_HEIGHT = vh * 9 + STATUSBAR_HEIGHT;
export const PAGE_WIDTH = vw * 100;

export const createInsets = (value: number): Insets => ({
  top: value,
  bottom: value,
  left: value,
  right: value,
});

export const dateFormatter = (date: Date) => {
  return dayjs(date).format('YYYY-MM-DD');
};

/** e.g. "05/11/2026" → "May 11, 2026"; also accepts ISO and other dayjs-parsable strings. */
export const formatLongDate = (input?: string | null) => {
  if (input == null || input === '') return '';
  const trimmed = String(input).trim();
  const us = dayjs(trimmed, 'MM/DD/YYYY', true);
  if (us.isValid()) return us.format('MMMM D, YYYY');
  const dmy = dayjs(trimmed, 'DD/MM/YYYY', true);
  if (dmy.isValid()) return dmy.format('MMMM D, YYYY');
  const parsed = dayjs(trimmed);
  return parsed.isValid() ? parsed.format('MMMM D, YYYY') : trimmed;
};

export const timeFormatter = (date: Date | string) => {
  return dayjs(date).format('hh:mm a');
};

/** "08:00:00" / "21:00:00" → "8:00 AM" / "9:00 PM" (naive clock, no TZ). */
export const formatTime12h = (input?: string | null): string => {
  if (input == null || input === '') return '';
  const trimmed = String(input).trim();
  const strictFormats = ['HH:mm:ss', 'HH:mm', 'H:mm:ss', 'H:mm'] as const;
  for (const fmt of strictFormats) {
    const d = dayjs(trimmed, fmt, true);
    if (d.isValid()) return d.format('h:mm A');
  }
  const loose = dayjs(trimmed);
  return loose.isValid() ? loose.format('h:mm A') : trimmed;
};

export const formatTimeRange12h = (
  start?: string | null,
  end?: string | null,
): string => {
  const a = formatTime12h(start);
  const b = formatTime12h(end);
  if (!a && !b) return '';
  if (!a) return b;
  if (!b) return a;
  return `${a} - ${b}`;
};

/**
 * UTC/ISO instant → device-local 12h time (e.g. "8:00 PM").
 * Prefer `scheduled_start_at` / `start_at_utc` over raw `appointment_start_time`.
 */
export const formatUtcToLocalTime12h = (input?: string | null): string => {
  if (input == null || input === '') return '';
  const d = dayjs(String(input).trim());
  return d.isValid() ? d.format('h:mm A') : '';
};

/** UTC/ISO instant → device-local long date (e.g. "July 21, 2026"). */
export const formatUtcToLocalDate = (input?: string | null): string => {
  if (input == null || input === '') return '';
  const d = dayjs(String(input).trim());
  return d.isValid() ? d.format('MMMM D, YYYY') : '';
};

export const formatUtcToLocalTimeRange12h = (
  start?: string | null,
  end?: string | null,
): string => {
  const a = formatUtcToLocalTime12h(start);
  const b = formatUtcToLocalTime12h(end);
  if (!a && !b) return '';
  if (!a) return b;
  if (!b) return a;
  return `${a} - ${b}`;
};

/**
 * Booking/card date from `scheduled_start_at` (device local).
 * Falls back to legacy date strings only when scheduled ISO is missing.
 */
export const formatBookingLocalDate = (booking?: {
  scheduled_start_at?: string | null;
  is_rescheduled?: boolean;
  rescheduled_appointment_date?: string | null;
  appointment_date?: string | null;
} | null): string => {
  if (!booking) return '';
  const fromUtc = formatUtcToLocalDate(booking.scheduled_start_at);
  if (fromUtc) return fromUtc;
  const legacy = booking.is_rescheduled
    ? booking.rescheduled_appointment_date
    : booking.appointment_date;
  return formatLongDate(legacy ?? '');
};

/**
 * UTC ISO → wall-clock `HH:mm:ss` in the given IANA timezone (default: device).
 */
export const utcIsoToWallClock = (
  utcIso?: string | null,
  timeZone?: string,
): string => {
  if (!utcIso?.trim()) return '';
  const d = new Date(utcIso);
  if (Number.isNaN(d.getTime())) return '';

  const tz = timeZone?.trim() || getDeviceTimezone();
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone: tz,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(d);

  const hour = parts.find(p => p.type === 'hour')?.value ?? '00';
  const minute = parts.find(p => p.type === 'minute')?.value ?? '00';
  const second = parts.find(p => p.type === 'second')?.value ?? '00';
  return `${hour}:${minute}:${second}`;
};

/** Wall-clock time → picker value (shows the same HH:mm on any device timezone). */
export const wallClockToPickerValue = (wallClock?: string | null): string => {
  if (!wallClock?.trim()) return '';
  return timeToISOString(wallClock);
};

/**
 * UTC ISO → picker value using profile/business timezone wall clock (not device offset).
 */
export const slotUtcToPickerValue = (
  utcIso?: string | null,
  timeZone?: string,
): string => wallClockToPickerValue(utcIsoToWallClock(utcIso, timeZone));

/** @deprecated Prefer `slotUtcToPickerValue` for manage-slots (uses device local offset). */
export const utcIsoToPickerValue = (utcIso?: string | null): string => {
  if (!utcIso?.trim()) return '';
  const d = new Date(utcIso);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString();
};

export const formatTimer = (s: number): string => {
  const mins = Math.floor(s / 60)
    .toString()
    .padStart(2, '0');
  const secs = (s % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
};

/** PhoneInput `callingCode` is often digits only; API expects a leading + (e.g. +971). */
export const normalizeDialingCode = (
  code: string | number | null | undefined,
): string => {
  if (code === null || code === undefined) return '';
  const s = String(code).trim();
  if (!s) return '';
  return s.startsWith('+') ? s : `+${s}`;
};

const isFileLike = (val: any) =>
  typeof val === 'object' &&
  val !== null &&
  'uri' in val &&
  (val.uri || val.name);

/** Normalize image-picker assets for React Native multipart uploads (especially iOS). */
export const toUploadAsset = (asset: any) => {
  if (!asset || typeof asset !== 'object' || !asset.uri) return asset;
  return {
    uri: asset.uri,
    type: asset.type ?? 'image/jpeg',
    name: asset.name ?? asset.fileName ?? 'image.jpg',
    fileName: asset.fileName ?? asset.name ?? 'image.jpg',
  };
};

/** True when a URI points at an already-uploaded remote file (not a device pick). */
export const isRemoteUploadUri = (uri: string | null | undefined): boolean => {
  if (!uri || typeof uri !== 'string') return false;
  const u = uri.trim().toLowerCase();
  return u.startsWith('http://') || u.startsWith('https://');
};

/** True when the value is a newly picked local image, not an existing server URL. */
export const isDevicePickedAsset = (value: unknown): boolean => {
  if (!value || typeof value !== 'object' || !('uri' in value)) return false;
  const uri = (value as { uri?: string }).uri;
  return typeof uri === 'string' && uri.length > 0 && !isRemoteUploadUri(uri);
};

/** True when FormData from Manage Slots includes at least one `slots[n][…]` entry. */
export const formDataHasSlotEntries = (
  formData: FormData | null | undefined,
): boolean => {
  if (!formData) return false;
  const parts = (formData as { _parts?: [string, unknown][] })._parts;
  if (!Array.isArray(parts) || parts.length === 0) return false;
  return parts.some(
    ([key]) => typeof key === 'string' && /^slots\[\d+\]/.test(key),
  );
};

export const formHandler = (data: any) => {
  let formdata = new FormData();

  if (data) {
    Object.entries(data).forEach(item => {
      if (item[1]) {
        if (
          typeof item[1] === 'object' &&
          item[1]?.length &&
          item[1]?.length > 0
        ) {
          item[1].forEach((i, index) => {
            if (
              item[0] !== 'valid_id' &&
              item[0] !== 'files' &&
              item[0] !== 'images' &&
              typeof i === 'object'
            ) {
              Object.entries(i).forEach(element => {
                const key = `${item[0]}[${index}][${element[0]}]`;
                const val = element[1];
                if (isFileLike(val)) {
                  formdata.append(key, val as any);
                } else if (
                  typeof val === 'string' ||
                  typeof val === 'number' ||
                  val == null
                ) {
                  formdata.append(key, val == null ? '' : String(val));
                } else {
                  formdata.append(key, val as any);
                }
              });
            } else {
              formdata.append(`${item[0]}[${index}]`, i);
            }
          });
        } else if (
          item[0] !== 'image' &&
          item[0] !== 'photo' &&
          item[0] !== 'file' &&
          typeof item[1] === 'object'
        ) {
          Object.entries(item[1]).forEach(element => {
            const val = element[1];
            if (isFileLike(val)) {
              formdata.append(`${item[0]}[${element[0]}]`, val as any);
            } else {
              formdata.append(`${item[0]}[${element[0]}]`, element[1] as any);
            }
          });
        } else {
          formdata.append(item[0], item[1]);
        }
      }
    });
  }

  return formdata;
};

export const capitalize = (str: string) => {
  if (str) {
    return str
      ?.split(' ')
      .map(w => w.charAt(0).toUpperCase() + w.slice(1))
      .join(' ');
  }
  return '';
};

export const getGreetingText = () => {
  const hour = new Date().getHours();

  if (hour >= 5 && hour < 12) {
    return 'Good Morning';
  } else if (hour >= 12 && hour < 17) {
    return 'Good Afternoon';
  } else if (hour >= 17 && hour < 21) {
    return 'Good Evening';
  } else {
    return 'Good Night';
  }
};

let cachedStates: { label: string; value: string }[] | null = null;
const cachedCitiesByState = new Map<string, { label: string; value: string }[]>();

export const getStates = () => {
  if (cachedStates) return cachedStates;
  const states = State.getStatesOfCountry('AE');
  cachedStates = states.map(item => ({ label: item?.name, value: item?.name }));
  return cachedStates;
};

export const getCities = value => {
  if (value) {
    const cached = cachedCitiesByState.get(value);
    if (cached) return cached;

    const state = State.getStatesOfCountry('AE').find(
      item => item.name === value,
    );
    if (!state) return [];
    const cities = City.getCitiesOfState('AE', state.isoCode);
    const options = cities.map(item => ({ label: item?.name, value: item?.name }));
    cachedCitiesByState.set(value, options);
    return options;
  }

  return [];
};

export const timeToISOString = (time: string, date: Date = new Date()) => {
  if (!time) return '';
  const [hours, minutes, seconds] = time.split(':').map(Number);
  const isoDate = new Date(date);
  isoDate.setHours(hours, minutes, seconds || 0, 0);
  return isoDate.toISOString();
};

export const getStatusColor = (status: string) => {
  const key = status?.toLowerCase()?.replace(/_/g, '-').trim();

  const statusColors: Record<string, string> = {
    pending: colors.pending,
    upcoming: colors.upcoming,
    rejected: colors.rejected,
    rescheduled: colors.rescheduled,
    past: colors.past,
    completed: colors.past,
    'in-progress': colors['in-progress'],
    approved: colors.upcoming,
    cancelled: colors.rejected,
  };

  return statusColors[key] ?? colors.black;
};

export const formatTime = (time: string) => {
  if (!time) return '';

  if (time.includes('T')) {
    const date = new Date(time);
    const hh = String(date.getHours()).padStart(2, '0');
    const mm = String(date.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}:00`;
  }

  const [hh, mm] = time.split(':');
  return `${hh.padStart(2, '0')}:${mm.padStart(2, '0')}:00`;
};
