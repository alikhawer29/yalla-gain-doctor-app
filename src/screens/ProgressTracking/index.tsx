import React, { useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Dimensions,
  TouchableOpacity,
  View,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { useNavigation, useRoute } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import images from '../../assets/images';
import CardWrapper from '../../components/CardWrapper';
import Dropdown from '../../components/Dropdown';
import Image from '../../components/Image';
import Row from '../../components/Row';
import Text from '../../components/Text';
import Wrapper from '../../components/Wrapper';
import { RootStackParamList } from '../../interfaces';
import colors from '../../utils/colors';
import { heightPixel, vw, widthPixel } from '../../utils/helper';
import { ROUTES } from '../../utils/routes';
import CircularProgress from './components/CircularProgress';
import ProgressBmiChart from './components/ProgressBmiChart';
import styles from './styles';
import useProgressTrackingController from './useProgressTrackingController';

type ProgressTrackingNavigationProp = StackNavigationProp<
  RootStackParamList,
  'ProgressTracking'
>;

/** Center card + summary: preserve small fractional kcal (API uses floats). */
const formatCaloriesForDisplay = (kcal: number): string => {
  if (!Number.isFinite(kcal)) return '0';
  if (kcal === 0) return '0';
  const a = Math.abs(kcal);
  if (a < 1) {
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 2,
      minimumFractionDigits: 0,
    }).format(kcal);
  }
  if (a < 100) {
    return new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 1,
      minimumFractionDigits: 0,
    }).format(kcal);
  }
  return Math.round(kcal).toLocaleString();
};

const chartConfigBase = {
  backgroundGradientFrom: colors.blackish_gray,
  backgroundGradientFromOpacity: 0,
  backgroundGradientTo: colors.blackish_gray,
  backgroundGradientToOpacity: 0,
  color: (opacity = 1) => `rgba(17, 128, 118, ${opacity})`,
  /** Must be `(opacity) => …` — returning a plain color breaks X/Y label rendering in chart-kit. */
  labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
  propsForBackgroundLines: {
    strokeWidth: 1,
    stroke: colors.gray,
  },
  propsForLabels: {
    fontSize: 11,
    fill: colors.white,
  },
};

const ProgressTracking = () => {
  const navigation = useNavigation<ProgressTrackingNavigationProp>();
  const route = useRoute();
  const winW = Dimensions.get('window').width;
  const [bmiChartWidth, setBmiChartWidth] = useState(
    Math.max(winW - widthPixel(40), 120),
  );

  const {
    values: {
      userId,
      isBootstrapping,
      isError,
      bmiChartData,
      caloriesLineData,
      totalSteps,
      totalCalories,
      caloriesProgressPct,
      caloriesFilter,
      selectedYear,
      yearOptions,
      caloriesFilterOptions,
    },
    functions: {
      onChangeYear,
      onChangeCaloriesFilter,
    },
  } = useProgressTrackingController();

  const maxCaloriesInChart = Math.max(
    0,
    ...(caloriesLineData.datasets[0]?.data ?? []),
  );

  const caloriesLineChartConfig = useMemo(() => {
    const decimalPlaces =
      maxCaloriesInChart <= 0
        ? 0
        : maxCaloriesInChart < 1
          ? 2
          : maxCaloriesInChart < 50
            ? 1
            : 0;
    return {
      ...chartConfigBase,
      decimalPlaces,
      formatYLabel: (yLabel: string) => {
        const n = parseFloat(String(yLabel).replace(/,/g, ''));
        if (!Number.isFinite(n)) return yLabel;
        if (decimalPlaces === 2) return String(Number(n.toFixed(2)));
        if (decimalPlaces === 1) return String(Number(n.toFixed(1)));
        return String(Math.round(n));
      },
    };
  }, [maxCaloriesInChart]);

  const onViewAvatarDetail = () => {
    navigation.navigate(ROUTES.AVATAR_DETAIL as never, {
      id: (route.params as { id?: string | number } | undefined)?.id,
    } as never);
  };

  const caloriesChartW = vw * 100 - widthPixel(20);

  return (
    <Wrapper scrollable bottom_bar>
      <Row gap={5}>
        {/* <View style={{ flex: 1 }}>
          <CardWrapper height={300} padding={10} color={colors.blackish_gray}>
            <TouchableOpacity
              onPress={onViewAvatarDetail}
              style={{ flex: 0.9, padding: heightPixel(0) }}>
              <Image
                source={images.avatar.fat}
                style={styles.avatar}
                resize="contain"
              />
            </TouchableOpacity>
          </CardWrapper>
        </View> */}
        <View style={{ flex: 1 }}>
          <CardWrapper height={300} padding={10} color={colors.blackish_gray}>
            <TouchableOpacity
              onPress={onViewAvatarDetail}
              style={{ flex: 0.9, padding: heightPixel(0) }}>
              <Image
                source={images.avatar.slim}
                style={styles.avatar}
                resize="contain"
              />
            </TouchableOpacity>
          </CardWrapper>
        </View>
      </Row>

      {!userId ? (
        <View style={styles.centerMsg}>
          <Text color={colors.icon_gray} style={{ textAlign: 'center' }}>
            Open progress from a booking with a user selected to see health data.
          </Text>
        </View>
      ) : (
        <>
          <View style={styles.chartSection}>
            <View style={styles.chartHeaderRow}>
              <Text weight="semibold" size={20}>
                Progress Graph — BMI
              </Text>
              <View style={styles.yearDropdown}>
                <Dropdown
                  value={String(selectedYear)}
                  onChangeText={onChangeYear}
                  options={yearOptions}
                  height={35}
                  zIndex={3000}
                />
              </View>
            </View>

            <View
              onLayout={e =>
                setBmiChartWidth(
                  Math.max(e.nativeEvent.layout.width, 120),
                )
              }>
              {isBootstrapping ? (
                <ActivityIndicator
                  color={colors.primary}
                  style={{ marginVertical: heightPixel(40) }}
                />
              ) : (
                <ProgressBmiChart
                  width={bmiChartWidth}
                  height={heightPixel(260)}
                  data={bmiChartData}
                />
              )}
            </View>
            {isError ? (
              <Text size={12} color={colors.icon_gray}>
                Could not load BMI graph. Pull to refresh or try again later.
              </Text>
            ) : null}
          </View>

          <Row gap={15} style={{ marginTop: heightPixel(20) }}>
            <View style={{ flex: 1 }}>
              <CardWrapper
                height={150}
                padding={15}
                color={colors.blackish_gray}
                border_radius={15}>
                <Text weight="semibold" size={14}>
                  Steps
                </Text>
                <Row
                  justify="space-between"
                  align="center"
                  style={{
                    flex: 1,
                    marginTop: heightPixel(10),
                  }}>
                  <Image
                    source={images.steps_graph}
                    style={styles.stepsMiniGraph}
                    resize="contain"
                  />
                  <View style={{ alignItems: 'center' }}>
                    <Text weight="semibold" size={23}>
                      {totalSteps.toLocaleString()}
                    </Text>
                    <Text size={12} color={colors.icon_gray}>
                      Steps
                    </Text>
                  </View>
                </Row>
              </CardWrapper>
            </View>
            <View
              style={{
                flex: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}>
              <CircularProgress
                size={widthPixel(120)}
                strokeWidth={widthPixel(15)}
                progress={caloriesProgressPct}
                color={colors.primary}>
                <View style={{ alignItems: 'center' }}>
                  <Text weight="semibold" size={18}>
                    {formatCaloriesForDisplay(totalCalories)}
                  </Text>
                  <Text size={14}>Cal</Text>
                </View>
              </CircularProgress>
            </View>
          </Row>

          <View style={{ marginTop: heightPixel(30) }}>
            <Row
              justify="space-between"
              align="center"
              style={styles.caloriesHeader}>
              <Text weight="semibold" size={20}>
                Calories
              </Text>
              <View style={styles.caloriesDropdown}>
                <Dropdown
                  value={caloriesFilter}
                  onChangeText={onChangeCaloriesFilter}
                  options={caloriesFilterOptions}
                  height={35}
                  zIndex={2000}
                />
              </View>
            </Row>
            <View style={styles.caloriesChartWrap}>
              {isBootstrapping ? (
                <ActivityIndicator
                  color={colors.primary}
                  style={{ marginTop: heightPixel(80) }}
                />
              ) : (
                <LineChart
                  data={caloriesLineData}
                  width={caloriesChartW}
                  height={heightPixel(240)}
                  chartConfig={caloriesLineChartConfig}
                  formatYLabel={caloriesLineChartConfig.formatYLabel}
                  bezier
                  withDots
                  withVerticalLines={false}
                  withOuterLines={false}
                  withHorizontalLabels
                  withVerticalLabels
                  segments={4}
                  yAxisLabel=""
                  yAxisSuffix=""
                  fromZero
                />
              )}
            </View>
          </View>
        </>
      )}
    </Wrapper>
  );
};

export default ProgressTracking;
