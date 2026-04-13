import { memo, useEffect } from 'react';
import Animated, {
  Easing,
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';

import { isNumber } from 'remeda';

import { useTheme } from '../../hooks/use-theme.native';

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const defaultSize = 24;
const defaultStrokeWidth = 2;
const defaultMin = 0;
const defaultMax = 100;
const defaultDuration = 300;

interface CircularProgressProps {
  /** Current progress value */
  progress: number;
  /**
   * Starting value for animation
   * @default progress
   */
  initialValue?: number;
  /**
   * Minimum value of range
   * @default 0
   */
  min?: number;
  /**
   * Maximum value of range
   * @default 100
   */
  max?: number;
  /**
   * Circle diameter in pixels
   * @default 24
   */
  size?: number;
  /**
   * Progress stroke width
   * @default 2
   */
  strokeWidth?: number;
  /**
   * Color of progress indicator
   * @default theme.colors['ink.action-primary-default']
   */
  activeStrokeColor?: string;
  /**
   * Color of background circle
   * @default theme.colors['ink.border-transparent']
   */
  inactiveStrokeColor?: string;
  /**
   * Animation duration in milliseconds
   * @default 300
   */
  duration?: number;
}

function CircularProgressImpl({
  progress,
  initialValue,
  min = defaultMin,
  max = defaultMax,
  size = defaultSize,
  strokeWidth = defaultStrokeWidth,
  activeStrokeColor,
  inactiveStrokeColor,
  duration = defaultDuration,
}: CircularProgressProps) {
  const theme = useTheme();
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const animatedProgress = useSharedValue(initialValue ?? progress);

  useEffect(() => {
    if (isNumber(initialValue)) {
      animatedProgress.value = initialValue;
    }
    animatedProgress.value = withTiming(progress, {
      duration,
      easing: Easing.linear,
    });
  }, [animatedProgress, initialValue, progress, duration]);

  const animatedProps = useAnimatedProps(() => {
    const normalized = interpolate(animatedProgress.value, [min, max], [0, 1], Extrapolation.CLAMP);
    const strokeDashoffset = circumference * (1 - normalized);
    return { strokeDashoffset };
  });

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        stroke={inactiveStrokeColor ?? theme.colors['ink.border-transparent']}
      />
      <AnimatedCircle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        stroke={activeStrokeColor ?? theme.colors['ink.action-primary-default']}
        strokeDasharray={circumference}
        animatedProps={animatedProps}
        transform={`rotate(-90 ${center} ${center})`}
      />
    </Svg>
  );
}

export const CircularProgress = memo(CircularProgressImpl);
