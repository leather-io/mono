import { TouchableOpacity } from 'react-native';

import { Box, Text } from '@/ui';

type ButtonVariant = 'solid' | 'outline' | 'ghost';
type ButtonSize = 'medium' | 'small';

export interface ButtonProps {
  variant: ButtonVariant;
  size?: ButtonSize;
  onPress: () => unknown;
  label: string;
}

function getColors(variant: ButtonVariant) {
  switch (variant) {
    case 'solid':
      return {
        backgroundColor: 'ink.action-primary-default',
        textColor: 'ink.background-primary',
      } as const;
    case 'ghost':
      return {
        textColor: 'ink.text-primary',
      } as const;
    case 'outline':
      return {
        borderColor: 'ink.text-primary',
        borderWidth: 1,
        textColor: 'ink.text-primary',
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

export const Button = ({ onPress, label, variant, size = 'medium' }: ButtonProps) => {
  const colorStyles = getColors(variant);
  const sizeStyles = getSize(size);

  return (
    <TouchableOpacity onPress={onPress} style={{ flexDirection: 'row' }}>
      <Box
        borderRadius="xs"
        p={sizeStyles.p}
        gap={sizeStyles.gap}
        flexDirection="row"
        backgroundColor={colorStyles.backgroundColor}
        borderWidth={colorStyles.borderWidth}
        borderColor={colorStyles.borderColor}
      >
        <Text color={colorStyles.textColor} variant="label02">
          {label}
        </Text>
      </Box>
    </TouchableOpacity>
  );
};
