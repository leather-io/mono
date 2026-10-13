import { MinusIcon, PlusIcon } from '../../icons/index.native';
import { Box } from '../box/box.native';
import { IconButton, type IconButtonProps } from '../icon-button/icon-button.native';
import { Text, type TextProps } from '../text/text.native';
import {
  NumericInputProvider,
  type NumericInputProviderProps,
  useNumericInputContext,
} from './numeric-input-provider.shared';

export type NumericInputProps = NumericInputProviderProps;

export function NumericInput({ children, ...props }: NumericInputProps) {
  return (
    <NumericInputProvider {...props}>
      <Box
        flexDirection="row"
        alignItems="center"
        borderWidth={1}
        borderColor="ink.border-transparent"
        borderRadius="md"
      >
        {children}
      </Box>
    </NumericInputProvider>
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

interface DisplayProps extends TextProps {
  formatter?(value: number, decimals?: number): string;
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

NumericInput.Increment = Increment;
NumericInput.Decrement = Decrement;
NumericInput.Display = Display;
