import { ComponentProps } from 'react';

import { styled } from 'leather-styles/jsx';

import { MinusIcon, PlusIcon } from '../../icons/index.web';
import { IconButton, type IconButtonProps } from '../icon-button/icon-button.web';
import {
  NumericInputProvider,
  type NumericInputProviderProps,
  useNumericInputContext,
} from './numeric-input-provider.shared';

export type NumericInputProps = NumericInputProviderProps;

type ButtonProps = Omit<IconButtonProps, 'icon'>;

export function NumericInput({ children, ...props }: NumericInputProps) {
  return (
    <NumericInputProvider {...props}>
      <styled.div
        display="flex"
        flexDirection="row"
        alignItems="center"
        borderWidth="1px"
        borderColor="ink.border-transparent"
        borderRadius="md"
      >
        {children}
      </styled.div>
    </NumericInputProvider>
  );
}

function Increment(props: ButtonProps) {
  const { handlePressIn, handlePressOut, disabled, max, value } = useNumericInputContext();

  return (
    <IconButton
      onPointerDown={() => handlePressIn('increment')}
      onPointerUp={handlePressOut}
      onPointerLeave={handlePressOut}
      disabled={disabled || value >= max}
      icon={<PlusIcon />}
      px="space.03"
      py="space.03"
      borderLeftWidth="1px"
      borderLeftColor="ink.border-transparent"
      rounded="none"
      {...props}
    />
  );
}

function Decrement(props: ButtonProps) {
  const { handlePressIn, handlePressOut, disabled, min, value } = useNumericInputContext();

  return (
    <IconButton
      onPointerDown={() => handlePressIn('decrement')}
      onPointerUp={handlePressOut}
      onPointerLeave={handlePressOut}
      disabled={disabled || value <= min}
      icon={<MinusIcon />}
      px="space.03"
      py="space.03"
      borderRightWidth="1px"
      borderRightColor="ink.border-transparent"
      rounded="none"
      {...props}
    />
  );
}

export interface DisplayProps extends ComponentProps<typeof styled.span> {
  formatter?(value: number, decimals?: number): string;
}

function Display({ formatter: customFormatter, ...spanProps }: DisplayProps) {
  const { value, decimals, formatter: contextFormatter } = useNumericInputContext();
  const formatter = customFormatter ?? contextFormatter;

  return (
    <styled.span
      flex={1}
      px="space.05"
      fontFamily="MarchePro-Super"
      fontSize="18px"
      lineHeight="24px"
      textAlign="center"
      fontVariantNumeric="tabular-nums"
      userSelect="none"
      {...spanProps}
    >
      {formatter(value, decimals)}
    </styled.span>
  );
}

NumericInput.Increment = Increment;
NumericInput.Decrement = Decrement;
NumericInput.Display = Display;
