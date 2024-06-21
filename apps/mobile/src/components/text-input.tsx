import { ComponentPropsWithoutRef, ReactNode } from 'react';
import { TextInput as RNTextInput } from 'react-native';

import {
  BaseTheme,
  LayoutProps,
  OpacityProps,
  ResponsiveValue,
  SpacingProps,
  SpacingShorthandProps,
  VisibleProps,
  composeRestyleFunctions,
  layout,
  opacity,
  spacing,
  spacingShorthand,
  useRestyle,
  useTheme,
  visible,
} from '@shopify/restyle';

import { Box, Text, Theme, TextInput as UITextInput } from '@leather.io/ui/native';

const inputRestyleFunctions = [opacity, visible, spacing, spacingShorthand, layout];

type BaseInputProps<Theme extends BaseTheme> = OpacityProps<Theme> &
  VisibleProps<Theme> &
  SpacingProps<Theme> &
  SpacingShorthandProps<Theme> &
  LayoutProps<Theme>;

type Props = BaseInputProps<Theme> & ComponentPropsWithoutRef<typeof RNTextInput>;
const composedRestyleFunction = composeRestyleFunctions<Theme, Props>(inputRestyleFunctions);

export type InputState = 'default' | 'focused' | 'error';

function whenInputState<T>(inputState: InputState, match: Record<InputState, T>) {
  switch (inputState) {
    case 'default':
      return match.default;
    case 'focused':
      return match.focused;
    case 'error':
      return match.error;
  }
}

export function TextInput({
  inputState,
  Icon,
  ...rest
}: Props & {
  inputState: InputState;
  Icon?: ReactNode;
}) {
  const theme = useTheme<Theme>();
  const props = useRestyle(composedRestyleFunction, rest);

  const borderColor = whenInputState<ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']>>(
    inputState,
    {
      default: 'base.ink.border-default',
      focused: 'base.ink.action-primary-default',
      error: 'base.red.action-primary-default',
    }
  );

  return (
    <Box>
      <UITextInput
        placeholderTextColor={theme.colors['base.ink.text-subdued']}
        borderWidth={1}
        borderColor={borderColor}
        p="4"
        color="base.ink.action-primary-default"
        {...props}
      />
      {inputState === 'error' ? (
        <Box position="absolute" bottom={5}>
          <Text color="base.red.action-primary-default" variant="caption01">
            Something is wrong!
          </Text>
        </Box>
      ) : null}
    </Box>
  );
}
