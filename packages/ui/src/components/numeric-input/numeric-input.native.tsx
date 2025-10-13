import { ReactNode, useEffect, useRef } from 'react';

import { clamp } from 'remeda';

import { MinusIcon, PlusIcon } from '../../icons/index.native';
import { Box } from '../box/box.native';
import { IconButton, type IconButtonProps } from '../icon-button/icon-button.native';
import { Text, type TextProps } from '../text/text.native';
import { NumericInputContext, useNumericInputContext } from './numeric-input-context.native';

const longPressDelay = 500;
const repeatRate = 150;

export interface NumericInputProps {
  value: number;
  onChange: (value: number) => void;
  step?: number;
  min?: number;
  max?: number;
  longPressStep?: number;
  disabled?: boolean;
  formatter?: (value: number, decimals?: number) => string;
  children: ReactNode;
}

export function NumericInput({
  value,
  onChange,
  step = 1,
  min = Number.MIN_SAFE_INTEGER,
  max = Number.MAX_SAFE_INTEGER,
  longPressStep,
  disabled = false,
  formatter = defaultFormatter,
  children,
}: NumericInputProps) {
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

  return (
    <NumericInputContext.Provider
      value={{
        value,
        decimals,
        formatter,
        handlePressIn,
        handlePressOut,
        disabled,
        min,
        max,
      }}
    >
      <Box
        flexDirection="row"
        alignItems="center"
        borderWidth={1}
        borderColor="ink.border-transparent"
        borderRadius="md"
      >
        {children}
      </Box>
    </NumericInputContext.Provider>
  );
}

type ButtonProps = Omit<IconButtonProps, 'icon'>;

function Increment(props: ButtonProps) {
  const { handlePressIn, handlePressOut, disabled, max, value } = useNumericInputContext();

  return (
    <IconButton
      alignSelf="stretch"
      justifyContent="center"
      p="3"
      borderLeftWidth={1}
      borderColor="ink.border-transparent"
      onPressIn={() => handlePressIn('increment')}
      onPressOut={handlePressOut}
      disabled={disabled || value >= max}
      icon={<PlusIcon />}
      {...props}
    />
  );
}

function Decrement(props: ButtonProps) {
  const { value, handlePressIn, handlePressOut, min, disabled } = useNumericInputContext();

  return (
    <IconButton
      alignSelf="stretch"
      justifyContent="center"
      p="3"
      borderRightWidth={1}
      borderColor="ink.border-transparent"
      onPressIn={() => handlePressIn('decrement')}
      onPressOut={handlePressOut}
      disabled={disabled || value <= min}
      icon={<MinusIcon />}
      {...props}
    />
  );
}

export interface DisplayProps extends TextProps {
  formatter?: (value: number, decimals?: number) => string;
}

function Display({ formatter: customFormatter, ...textProps }: DisplayProps) {
  const { value, decimals, formatter: contextFormatter } = useNumericInputContext();
  const formatter = customFormatter ?? contextFormatter;

  return (
    <Text
      px="5"
      fontFamily="MarchePro-Super"
      fontSize={18}
      lineHeight={24}
      textAlign="center"
      fontVariant={['tabular-nums']}
      {...textProps}
    >
      {formatter(value, decimals)}
    </Text>
  );
}

function defaultFormatter(value: number, decimals?: number): string {
  return decimals !== undefined ? value.toFixed(decimals) : String(value);
}

function countDecimals(value: number): number {
  return (String(value).split('.')[1] || '').length;
}

function roundToPrecision(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

function getStepDelta(direction: 'increment' | 'decrement', stepSize: number): number {
  return direction === 'increment' ? stepSize : -stepSize;
}

NumericInput.Increment = Increment;
NumericInput.Decrement = Decrement;
NumericInput.Display = Display;
