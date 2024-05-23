import { TouchableOpacity, ViewStyle } from 'react-native';

import { ResponsiveValue } from '@shopify/restyle';
import { Theme } from 'native';

import { Box } from '../box/box.native';
import { Text } from '../text/text.native';

type ButtonVariant = 'solid' | 'outline' | 'ghost';
type ButtonSize = 'medium' | 'small';

export interface ButtonProps {
  variant: ButtonVariant;
  size?: ButtonSize;
  onPress: () => unknown;
  label: string;
  style?: ViewStyle;
}

function getColors(
  variant: ButtonVariant
): Record<string, ResponsiveValue<keyof Theme['colors'], Theme['breakpoints']>> {
  switch (variant) {
    case 'solid':
      return {
        backgroundColor: 'dark.ink.action-primary-default',
        textColor: 'dark.ink.background-primary',
      } as const;
    case 'ghost':
      return {
        textColor: 'dark.ink.text-primary',
      } as const;
    case 'outline':
      return {
        borderColor: 'dark.ink.text-primary',
        textColor: 'dark.ink.text-primary',
      } as const;
  }
}

function getSize(size: ButtonSize) {
  switch (size) {
    case 'medium':
      return {
        p: '3',
        gap: '2',
      } as const;
    case 'small':
      return {
        p: '2',
        gap: '1',
      } as const;
  }
}

export function Button({ onPress, label, variant, size = 'medium', style }: ButtonProps) {
  const colorStyles = getColors(variant);
  const sizeStyles = getSize(size);

  return (
    <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row', ...style }}>
      <Box
        borderRadius="xs"
        p={sizeStyles.p}
        gap={sizeStyles.gap}
        flexDirection="row"
        backgroundColor={colorStyles.backgroundColor}
        borderWidth={colorStyles.borderColor ? 1 : undefined}
        borderColor={colorStyles.borderColor}
      >
        <Text color={colorStyles.textColor} variant="label02">
          {label}
        </Text>
      </Box>
    </TouchableOpacity>
  );
}
