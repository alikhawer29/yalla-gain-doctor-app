import fonts from '../assets/fonts';
import colors from './colors';
import { font, heightPixel, PAGE_WIDTH, widthPixel } from './helper';

export const LINE_CHART_PADDING_BOTTOM = heightPixel(16);
export const LINE_CHART_PADDING_TOP = heightPixel(10);

/** Whole numbers on Y axis (library defaults to e.g. 50.00). */
export const formatYAxisInteger = (yLabel: string) => {
  const n = parseFloat(String(yLabel).replace(/,/g, ''));
  if (!Number.isFinite(n)) return yLabel;
  return String(Math.round(n));
};

/** BMI / small decimal ranges on progress charts. */
export const formatYAxisOneDecimal = (yLabel: string) => {
  const n = parseFloat(String(yLabel).replace(/,/g, ''));
  if (!Number.isFinite(n)) return yLabel;
  if (n <= 0) return '0';
  const rounded = Math.round(n * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
};

export const getChartAreaWidth = (options?: {
  wrapperHorizontal?: number;
  cardHorizontal?: number;
}) => {
  const wrapper = options?.wrapperHorizontal ?? widthPixel(20);
  const card = options?.cardHorizontal ?? 0;
  return PAGE_WIDTH - wrapper * 2 - card * 2;
};

/** react-native-chart-kit: `style.paddingRight` = left gutter for Y-axis tick labels. */
export const lineChartYAxisGutter = (values: number[], segments: number) => {
  const nums = values.filter(v => typeof v === 'number' && Number.isFinite(v));
  const max = nums.length ? Math.max(0, ...nums) : 0;
  const min = 0;
  const seg = Math.max(1, segments);
  let maxDigits = 1;
  for (let i = 0; i <= seg; i++) {
    const tick = Math.round(min + ((max - min) * i) / seg);
    maxDigits = Math.max(maxDigits, String(tick).length);
  }
  return widthPixel(12 + maxDigits * 13);
};

export const lineChartSegmentsForData = (values: number[]) => {
  const nums = values.filter(v => typeof v === 'number' && Number.isFinite(v));
  if (nums.length === 0) return 1;
  const max = Math.max(0, ...nums);
  const min = Math.min(0, ...nums);
  const range = max - min;
  if (range === 0) return 1;
  if (range <= 2) return Math.max(1, Math.ceil(range));
  if (range <= 5) return Math.ceil(range);
  return 4;
};

export type LineChartFilter = 'weekly' | 'monthly' | 'yearly';

export const buildLineChartLayout = (
  values: number[],
  filter: LineChartFilter,
  areaWidth?: number,
) => {
  const segments = lineChartSegmentsForData(values);
  const yGutter = lineChartYAxisGutter(values, segments);
  const baseWidth =
    areaWidth ??
    getChartAreaWidth({
      wrapperHorizontal: widthPixel(10),
      cardHorizontal: widthPixel(15),
    });
  const xInset =
    filter === 'monthly'
      ? widthPixel(18)
      : filter === 'yearly'
      ? widthPixel(14)
      : widthPixel(10);
  const chartWidth = baseWidth - xInset;

  return {
    segments,
    width: chartWidth,
    yGutter,
    xLabelsOffset: widthPixel(8),
    yLabelsOffset: widthPixel(10),
  };
};

export const createLineChartConfig = (
  backgroundColor: string,
  options?: {
    decimalPlaces?: number;
    formatYLabel?: (yLabel: string) => string;
    labelColor?: (opacity?: number) => string;
  },
) => {
  const formatYLabel = options?.formatYLabel ?? formatYAxisInteger;
  return {
    backgroundGradientFrom: backgroundColor,
    backgroundGradientFromOpacity: 0,
    backgroundGradientTo: backgroundColor,
    backgroundGradientToOpacity: 0,
    color: (opacity = 1) => `rgba(17, 128, 118, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    labelColor: options?.labelColor ?? ((_opacity = 1) => colors.icon_gray),
    decimalPlaces: options?.decimalPlaces ?? 0,
    formatYLabel,
    propsForBackgroundLines: {
      strokeWidth: 1,
      stroke: colors.dark_gray,
    },
    propsForLabels: {
      fontFamily: fonts.sfpro.regular,
      fontSize: font(12),
    },
  };
};
