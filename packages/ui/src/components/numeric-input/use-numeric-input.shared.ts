import { useEffect, useRef } from 'react';

import { clamp } from 'remeda';

const longPressDelay = 500;
const repeatRate = 150;

export interface UseNumericInputProps {
  value: number;
  onChange(value: number): void;
  step?: number;
  min?: number;
  max?: number;
  longPressStep?: number;
  disabled?: boolean;
  formatter?(value: number, decimals?: number): string;
}

export interface NumericInputState {
  value: number;
  decimals: number;
  min: number;
  max: number;
  disabled: boolean;
  formatter(value: number, decimals?: number): string;
  handlePressIn(direction: 'increment' | 'decrement'): void;
  handlePressOut(): void;
}

export function useNumericInput({
  value,
  onChange,
  step = 1,
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
  longPressStep,
  disabled = false,
  formatter = defaultFormatter,
}: UseNumericInputProps): NumericInputState {
  const decimals = countDecimals(step);
  const repeatStepSize = longPressStep ?? step;
  const longPressTimer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const repeatTimer = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const direction = useRef<'increment' | 'decrement' | undefined>(undefined);
  const performStep = useRef<
    ((direction: 'increment' | 'decrement', stepSize: number) => void) | undefined
  >(undefined);

  useEffect(() => {
    return reset;
  }, []);

  useEffect(() => {
    if (disabled) reset();
  }, [disabled]);

  function normalizeValue(val: number): number {
    const rounded = roundToPrecision(val, decimals);
    return clamp(rounded, { min, max });
  }

  function reset() {
    if (longPressTimer.current !== undefined) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = undefined;
    }
    if (repeatTimer.current !== undefined) {
      clearInterval(repeatTimer.current);
      repeatTimer.current = undefined;
    }
    direction.current = undefined;
  }

  performStep.current = (dir: 'increment' | 'decrement', stepSize: number) => {
    const delta = getStepDelta(dir, stepSize);
    const nextValue = normalizeValue(value + delta);
    onChange(nextValue);
  };

  function startRepeat(dir: 'increment' | 'decrement') {
    performStep.current?.(dir, repeatStepSize);
    repeatTimer.current = setInterval(() => {
      performStep.current?.(dir, repeatStepSize);
    }, repeatRate);
  }

  function handlePressIn(dir: 'increment' | 'decrement') {
    direction.current = dir;
    longPressTimer.current = setTimeout(() => {
      startRepeat(dir);
    }, longPressDelay);
  }

  function handlePressOut() {
    const isLongPress = repeatTimer.current !== undefined;
    const dir = direction.current;

    reset();

    if (!isLongPress && dir) {
      performStep.current?.(dir, step);
    }
  }

  return {
    value,
    decimals,
    formatter,
    handlePressIn,
    handlePressOut,
    disabled,
    min,
    max,
  };
}

export function defaultFormatter(value: number, decimals?: number): string {
  return decimals !== undefined ? value.toFixed(decimals) : String(value);
}

export function countDecimals(value: number): number {
  return (String(value).split('.')[1] || '').length;
}

export function roundToPrecision(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

export function getStepDelta(direction: 'increment' | 'decrement', stepSize: number): number {
  return direction === 'increment' ? stepSize : -stepSize;
}
