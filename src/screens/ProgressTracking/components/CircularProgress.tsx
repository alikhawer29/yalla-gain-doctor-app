import React from 'react';
import { View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import colors from '../../../utils/colors';

type Props = {
  size: number;
  strokeWidth: number;
  progress: number;
  color: string;
  children?: React.ReactNode;
};

const CircularProgress = ({
  size,
  strokeWidth,
  progress,
  color,
  children,
}: Props) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <View
      style={{
        width: size,
        height: size,
        justifyContent: 'center',
        alignItems: 'center',
      }}>
      <Svg width={size} height={size}>
        <Circle
          stroke={colors.grayish_black}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        <Circle
          stroke={color}
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ position: 'absolute' }}>{children}</View>
    </View>
  );
};

export default CircularProgress;
