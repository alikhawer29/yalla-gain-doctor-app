import React, { useMemo } from 'react';
import { View } from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import Text from '../../../components/Text';
import type { HealthProgressBmiPoint } from '../../../redux/Apis/User';
import colors from '../../../utils/colors';
import { heightPixel, widthPixel } from '../../../utils/helper';
import {
  buildLineChartLayout,
  createLineChartConfig,
  formatYAxisOneDecimal,
  getChartAreaWidth,
  LINE_CHART_PADDING_BOTTOM,
} from '../../../utils/lineChart';
import styles from '../styles';

type Props = {
  data: HealthProgressBmiPoint[];
  height?: number;
};

const PROGRESS_CHART_AREA_WIDTH = getChartAreaWidth({
  wrapperHorizontal: widthPixel(20),
});

const LINE_CHART_PADDING_TOP = heightPixel(18);

const ProgressBmiChart = ({ data, height = heightPixel(220) }: Props) => {
  const chartPayload = useMemo(() => {
    const labels = data.map(d => d.label);
    const values = data.map(d => {
      const v = Number(d.bmi);
      return Number.isFinite(v) ? v : 0;
    });
    return {
      labels: labels.length ? labels : ['—'],
      datasets: [{ data: values.length ? values : [0] }],
    };
  }, [data]);

  const lineValues = chartPayload.datasets[0]?.data ?? [];
  const layout = useMemo(
    () =>
      buildLineChartLayout(lineValues, 'yearly', PROGRESS_CHART_AREA_WIDTH),
    [lineValues],
  );

  const chartConfig = useMemo(
    () =>
      createLineChartConfig(colors.blackish_gray, {
        decimalPlaces: 1,
        formatYLabel: formatYAxisOneDecimal,
      }),
    [],
  );

  if (!data.length) {
    return (
      <View style={styles.bmiChartEmpty}>
        <Text size={13} color={colors.icon_gray} style={{ textAlign: 'center' }}>
          No BMI data available for this period.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.bmiChartWrap}>
      <LineChart
        data={chartPayload}
        width={layout.width}
        height={height}
        chartConfig={chartConfig}
        formatYLabel={formatYAxisOneDecimal}
        bezier
        withDots
        withVerticalLines={false}
        withOuterLines={false}
        yAxisLabel=""
        yAxisSuffix=""
        fromZero
        segments={layout.segments}
        xLabelsOffset={layout.xLabelsOffset}
        yLabelsOffset={layout.yLabelsOffset}
        style={{
          paddingRight: layout.yGutter,
          paddingLeft: widthPixel(5),
          paddingTop: LINE_CHART_PADDING_TOP,
          paddingBottom: LINE_CHART_PADDING_BOTTOM,
        }}
      />
    </View>
  );
};

export default ProgressBmiChart;
