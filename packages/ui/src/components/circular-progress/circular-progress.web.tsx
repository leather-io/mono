import { memo, useEffect, useRef, useState } from 'react';

import { token } from 'leather-styles/tokens';
import { isNumber } from 'remeda';

const defaultSize = 24;
const defaultStrokeWidth = 2;
const defaultMin = 0;
const defaultMax = 100;
const defaultDuration = 300;

interface CircularProgressProps {
  progress: number;
  initialValue?: number;
  min?: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  activeStrokeColor?: string;
  inactiveStrokeColor?: string;
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
  const center = size / 2;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const hasAnimated = useRef(false);
  const [currentProgress, setCurrentProgress] = useState(initialValue ?? progress);

  useEffect(() => {
    if (!hasAnimated.current) {
      if (isNumber(initialValue)) {
        setCurrentProgress(initialValue);
      }
      requestAnimationFrame(() => {
        setCurrentProgress(progress);
        hasAnimated.current = true;
      });
      return;
    }
    setCurrentProgress(progress);
  }, [initialValue, progress]);

  const offset = computeStrokeDashoffset(currentProgress, min, max, circumference);

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        stroke={inactiveStrokeColor ?? token('colors.ink.border-transparent')}
      />
      <circle
        cx={center}
        cy={center}
        r={radius}
        fill="none"
        strokeWidth={strokeWidth}
        stroke={activeStrokeColor ?? token('colors.ink.action-primary-default')}
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform={`rotate(-90 ${center} ${center})`}
        style={{
          transition: `stroke-dashoffset ${duration}ms linear`,
        }}
      />
    </svg>
  );
}

export const CircularProgress = memo(CircularProgressImpl);

function computeStrokeDashoffset(
  progress: number,
  min: number,
  max: number,
  circumference: number
) {
  const normalized = Math.min(1, Math.max(0, (progress - min) / (max - min)));
  return circumference * (1 - normalized);
}
