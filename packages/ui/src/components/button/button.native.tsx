import { ComponentType, ReactElement, ReactNode, isValidElement } from 'react';

import { isNullish } from 'remeda';

import { IconProps } from '../../icons/icon/create-icon.native';
import { Theme } from '../../theme-native';
import { PressableRef, PressableRestyleProps } from '../pressable/pressable-core.native';
import { Pressable, PressableProps } from '../pressable/pressable.native';
import { Text } from '../text/text.native';

type ButtonVariant = 'solid' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';
type ButtonIntent = 'default' | 'danger';
interface VariantProps extends PressableRestyleProps {
  color?: keyof Theme['colors'];
}

export interface ButtonProps extends PressableProps {
  variant?: ButtonVariant;
  size?: ButtonSize;
  intent?: ButtonIntent;
  iconStart?: ComponentType<IconProps> | ReactElement;
  iconEnd?: ComponentType<IconProps> | ReactElement;
  children: ReactNode;
  disabled?: boolean;
  ref?: PressableRef;
}

export function Button({
  variant = 'solid',
  size = 'lg',
  intent = 'default',
  iconStart,
  iconEnd,
  children,
  disabled,
  ref,
  ...props
}: ButtonProps) {
  const { color, ...variantProps } = getButtonStyles({ size, variant, intent, disabled });

  return (
    <Pressable
      ref={ref}
      borderRadius="round"
      flexDirection="row"
      alignItems="center"
      justifyContent="center"
      disabled={disabled}
      px="3"
      {...variantProps}
      {...props}
    >
      {renderIcon(iconStart, { color, variant: 'small' })}
      <Text variant="label02" color={color}>
        {children}
      </Text>
      {renderIcon(iconEnd, { color, variant: 'small' })}
    </Pressable>
  );
}

function renderIcon(icon: ComponentType<IconProps> | ReactNode, props: IconProps) {
  if (isValidElement(icon) || isNullish(icon)) {
    return icon;
  }
  const IconComponent = icon as ComponentType<IconProps>;
  return <IconComponent {...props} />;
}

// Manually define variants and overrides, as Restyle has no compound variants support.
const sizes: Record<ButtonSize, VariantProps> = {
  sm: {
    height: 32,
    px: '3',
    gap: '1',
  },
  md: {
    height: 36,
    px: '3',
    gap: '1',
  },
  lg: {
    height: 48,
    px: '4',
    gap: '2',
  },
};

const baseVariantStyles: Record<ButtonVariant, VariantProps> = {
  solid: {
    bg: 'ink.action-primary-default',
    color: 'ink.background-primary',
  },
  outline: {
    borderWidth: 1,
    borderStyle: 'solid',
    borderColor: 'ink.border-default',
    color: 'ink.action-primary-default',
  },
  ghost: {
    color: 'ink.action-primary-default',
  },
};

const intentOverrides: Record<ButtonIntent, Partial<Record<ButtonVariant, VariantProps>>> = {
  default: {},
  danger: {
    solid: { bg: 'red.action-primary-default' },
    outline: { borderColor: 'red.border', color: 'red.action-primary-default' },
    ghost: { color: 'red.action-primary-default' },
  },
};

const disabledOverrides: Record<ButtonVariant, VariantProps> = {
  solid: { bg: 'ink.background-secondary', color: 'ink.text-non-interactive' },
  outline: { borderColor: 'ink.text-non-interactive', color: 'ink.text-non-interactive' },
  ghost: { color: 'ink.text-non-interactive' },
};

function getButtonStyles({
  size,
  variant,
  intent,
  disabled,
}: {
  size: ButtonSize;
  variant: ButtonVariant;
  intent: ButtonIntent;
  disabled?: boolean;
}) {
  const sizeStyles = sizes[size];
  const baseStyles = baseVariantStyles[variant];
  const intentStyles = intentOverrides[intent][variant];
  const disabledStyles = disabled ? disabledOverrides[variant] : {};

  return {
    ...sizeStyles,
    ...baseStyles,
    ...intentStyles,
    ...disabledStyles,
  };
}
