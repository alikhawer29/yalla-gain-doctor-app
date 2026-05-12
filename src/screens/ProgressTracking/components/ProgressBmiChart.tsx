import React, { useMemo } from 'react';
import { View } from 'react-native';
import Text from '../../../components/Text';
import Svg, {
  Circle,
  Line,
  Polyline,
  Rect,
  Text as SvgText,
} from 'react-native-svg';
import colors from '../../../utils/colors';
import type { HealthProgressBmiPoint } from '../../../redux/Apis/User';

type Props = {
  width: number;
  height?: number;
  data: HealthProgressBmiPoint[];
};

const GRAY_BAR = '#4A4A4A';
const GRID_COLOR = 'rgba(255,255,255,0.12)';
/** Left gutter for Y-axis numbers (0 → max). */
const CHART_LEFT = 40;
const PAD_R = 12;
const PAD_TOP = 16;
const PAD_BOTTOM = 36;
const GRID_SEGMENTS = 4;
const DOT_R = 5;
/** Keep dot stroke fully inside the card (circle extends above the bar top). */
const MIN_BAR_TOP = PAD_TOP + DOT_R + 4;

function formatYTick(val: number, maxScale: number): string {
  if (val <= 0) return '0';
  if (maxScale >= 100) return String(Math.round(val));
  if (maxScale >= 25) return String(Math.round(val * 10) / 10);
  return val.toFixed(1);
}

const ProgressBmiChart = ({ width, height = 240, data }: Props) => {
  const innerW = Math.max(width - CHART_LEFT - PAD_R, 1);
  const innerH = height - PAD_TOP - PAD_BOTTOM;
  const baselineY = PAD_TOP + innerH;

  const { bars, linePoints, labels, hasPositiveBmi, maxScale } = useMemo(() => {
    const labelsInner = data.map(d => d.label);
    const values = data.map(d => {
      const v = Number(d.bmi);
      return Number.isFinite(v) ? v : 0;
    });
    const maxRaw = Math.max(...values, 0);
    const maxScaleInner =
      maxRaw <= 0 ? 28 : Math.max(maxRaw * 1.12, 18);
    let hi = 0;
    if (maxRaw > 0) {
      hi = values.reduce(
        (best, v, i, arr) => (v > arr[best] ? i : best),
        0,
      );
    }
    const n = Math.max(data.length, 1);
    const step = innerW / n;
    const barW = step * 0.42;

    const barsInner = values.map((v, i) => {
      const centerX = CHART_LEFT + step * i + step / 2;
      const h = maxScaleInner <= 0 ? 0 : (v / maxScaleInner) * innerH;
      const barHeight = Math.max(h, v > 0 ? 3 : 1);
      const rawTop = baselineY - barHeight;
      const y = Math.max(MIN_BAR_TOP, rawTop);
      const drawHeight = baselineY - y;
      const x = centerX - barW / 2;
      const rx = Math.min(barW / 2, 10);
      const active = maxRaw > 0 && hi === i;
      return {
        x,
        y,
        w: barW,
        h: drawHeight,
        rx,
        fill: active ? colors.primary : GRAY_BAR,
        cx: centerX,
        topY: y,
      };
    });

    const pts = barsInner.map(b => `${b.cx},${b.topY}`).join(' ');

    return {
      bars: barsInner,
      linePoints: pts,
      labels: labelsInner,
      hasPositiveBmi: maxRaw > 0,
      maxScale: maxScaleInner,
    };
  }, [data, innerW, innerH, baselineY]);

  const grids = Array.from({ length: GRID_SEGMENTS + 1 }, (_, g) => {
    const t = g / GRID_SEGMENTS;
    const y = baselineY - t * innerH;
    const value = maxScale * t;
    return { y, key: g, value };
  });

  if (width <= 0) {
    return null;
  }

  if (!data.length) {
    return (
      <View
        style={{
          height,
          borderRadius: 12,
          backgroundColor: colors.blackish_gray,
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 16,
        }}>
        <Text size={13} color={colors.icon_gray} style={{ textAlign: 'center' }}>
          No BMI data available for this period.
        </Text>
      </View>
    );
  }

  return (
    <View style={{ backgroundColor: colors.blackish_gray, borderRadius: 12 }}>
      <Svg width={width} height={height}>
        {grids.map(({ y, key, value }) => (
          <React.Fragment key={key}>
            <Line
              x1={CHART_LEFT}
              x2={width - PAD_R}
              y1={y}
              y2={y}
              stroke={GRID_COLOR}
              strokeWidth={1}
              strokeDasharray="4 6"
            />
            <SvgText
              x={CHART_LEFT - 6}
              y={y + 4}
              fill={colors.icon_gray}
              fontSize={10}
              textAnchor="end">
              {formatYTick(value, maxScale)}
            </SvgText>
          </React.Fragment>
        ))}
        {bars.map((b, i) => (
          <Rect
            key={`bar-${i}`}
            x={b.x}
            y={b.y}
            width={b.w}
            height={b.h}
            rx={b.rx}
            ry={b.rx}
            fill={b.fill}
          />
        ))}
        {bars.length > 0 && hasPositiveBmi && (
          <>
            <Polyline
              points={linePoints}
              fill="none"
              stroke={colors.primary}
              strokeWidth={2.5}
            />
            {bars.map((b, i) => (
              <Circle
                key={`dot-${i}`}
                cx={b.cx}
                cy={b.topY}
                r={5}
                fill={colors.white}
                stroke={colors.primary}
                strokeWidth={2}
              />
            ))}
          </>
        )}
        {labels.map((lb, i) => {
          const step = innerW / Math.max(data.length, 1);
          const cx = CHART_LEFT + step * i + step / 2;
          return (
            <SvgText
              key={`lbl-${i}`}
              x={cx}
              y={baselineY + 18}
              fill={colors.white}
              fontSize={10}
              textAnchor="middle">
              {lb}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
};

export default ProgressBmiChart;
