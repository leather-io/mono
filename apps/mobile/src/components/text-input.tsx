import { ComponentPropsWithoutRef, RefObject } from 'react';
import { TextInput as RNTextInput } from 'react-native';

import { t } from '@lingui/macro';
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

import { Box, Text, TextInputProps, Theme, TextInput as UITextInput } from '@leather.io/ui/native';
import { assertUnreachable } from '@leather.io/utils';

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
    default:
      assertUnreachable(inputState);
  }
}

export function TextInput({
  inputState,
  inputRef,
  errorMessage,
  textVariant,
  TextInputComponent,
  ...rest
}: Props & {
  inputState: InputState;
  inputRef?: RefObject<RNTextInput | null>;
  errorMessage?: string;
  textVariant?: TextInputProps<Theme>['textVariant'];
  TextInputComponent?: typeof UITextInput;
}) {
  const _errorMessage =
    errorMessage ??
    t({
      id: 'input.default.error',
      message: 'An error has occurred',
    });
  const theme = useTheme<Theme>();
  const props = useRestyle(composedRestyleFunction, rest);

  const borderColor = whenInputState<ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']>>(
    inputState,
    {
      default: 'ink.border-default',
      focused: 'ink.action-primary-default',
      error: 'red.action-primary-default',
    }
  );

  const _TextInput = TextInputComponent ?? UITextInput;

  return (
    <Box>
      <_TextInput
        autoCorrect
        ref={inputRef}
        textVariant={textVariant}
        placeholderTextColor={theme.colors['ink.text-subdued']}
        borderWidth={1}
        borderColor={borderColor}
        borderRadius="sm"
        height={64}
        p="4"
        color="ink.action-primary-default"
        {...props}
      />
      {inputState === 'error' && (
        <Box>
          <Text color="red.action-primary-default" variant="caption01">
            {_errorMessage}
          </Text>
        </Box>
      )}
    </Box>
  );
}
