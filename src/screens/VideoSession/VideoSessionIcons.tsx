import Svg, { Path, Circle, Line, Rect } from 'react-native-svg';

const ICON = '#FFFFFF';

type IconProps = { size?: number; color?: string; active?: boolean };

export const BackChevronIcon = ({ size = 20, color = ICON }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M14.5 5.5L8 12l6.5 6.5"
      stroke={color}
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </Svg>
);

export const MicIcon = ({ size = 26, color = ICON, active = true }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x={9} y={3} width={6} height={11} rx={3} fill={active ? color : 'transparent'} stroke={color} strokeWidth={1.8} />
    <Path
      d="M6 11a6 6 0 0012 0M12 17v3"
      stroke={color}
      strokeWidth={1.8}
      strokeLinecap="round"
    />
    {!active ? (
      <Line x1={5} y1={5} x2={19} y2={19} stroke={color} strokeWidth={2} strokeLinecap="round" />
    ) : null}
  </Svg>
);

export const CameraIcon = ({ size = 26, color = ICON, active = true }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M4 8.5h3.2L9 6h6l1.8 2.5H20v9H4v-9z"
      stroke={color}
      strokeWidth={1.8}
      strokeLinejoin="round"
      fill={active ? 'transparent' : color}
      fillOpacity={active ? 0 : 0.25}
    />
    <Circle cx={12} cy={13} r={3.2} stroke={color} strokeWidth={1.8} />
    {!active ? (
      <Line x1={5} y1={5} x2={19} y2={19} stroke={color} strokeWidth={2} strokeLinecap="round" />
    ) : null}
  </Svg>
);

export const FlipCameraIcon = ({ size = 18, color = ICON }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path
      d="M7 7h6l2-2h4v12h-4l-2-2H7V7z"
      stroke={color}
      strokeWidth={1.6}
      strokeLinejoin="round"
    />
    <Path
      d="M5 9l2-2M5 15l2 2M19 9l-2-2M19 15l-2 2"
      stroke={color}
      strokeWidth={1.6}
      strokeLinecap="round"
    />
  </Svg>
);

export const SpeakerIcon = ({ size = 26, color = ICON, active = true }: IconProps) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path d="M5 10v4h3l5 4V6L8 10H5z" fill={color} />
    {active ? (
      <>
        <Path d="M16 9a4 4 0 010 6" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
        <Path d="M18 7a7 7 0 010 10" stroke={color} strokeWidth={1.8} strokeLinecap="round" />
      </>
    ) : (
      <Line x1={17} y1={8} x2={21} y2={16} stroke={color} strokeWidth={2} strokeLinecap="round" />
    )}
  </Svg>
);
