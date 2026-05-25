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

/** "08:00:00" / "21:00:00" → "8:00 AM" / "9:00 PM" */
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

export const getStates = () => {
  let states = State.getStatesOfCountry('AE');
  return states.map(item => ({ label: item?.name, value: item?.name }));
};

export const getCities = value => {
  if (value) {
    let state = State.getStatesOfCountry('AE').find(
      item => item.name === value,
    );
    if (!state) return [];
    let cities = City.getCitiesOfState('AE', state.isoCode);
    return cities.map(item => ({ label: item?.name, value: item?.name }));
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
  const key = status?.toLowerCase();

  return (
    colors[key] ||
    {
      pending: colors.pending,
      upcoming: colors.upcoming,
      rejected: colors.rejected,
      completed: colors.extra_light_gray,
      cancelled: colors.icon_gray,
      rescheduled: colors.rescheduled,
    }[key] ||
    colors.black
  );
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
