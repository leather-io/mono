import React, { ComponentPropsWithRef, ElementRef, forwardRef } from 'react';
import Svg, { SvgProps } from 'react-native-svg';

import { useTheme } from '@shopify/restyle';

import { Theme } from '../../theme-native';
import { IconSize, iconSizeMap } from './icon.shared';

export interface IconProps extends SvgProps {
  variant?: IconSize;
  color?: keyof Theme['colors'];
}

interface CreateNativeIconParams {
  displayName: string;
  icon: {
    small?: React.ComponentType<ComponentPropsWithRef<typeof Svg>>;
    medium?: React.ComponentType<ComponentPropsWithRef<typeof Svg>>;
    large?: React.ComponentType<ComponentPropsWithRef<typeof Svg>>;
  };
  defaultVariant?: IconSize;
}

export function createNativeIcon({
  icon,
  displayName,
  defaultVariant = 'medium',
}: CreateNativeIconParams) {
  const { small, medium, large } = icon;
  const fallback = small ?? medium ?? large;

  if (!fallback) {
    throw new Error(
      "Missing variant variant - at least one of: 'small', 'medium', 'large' should be specified."
    );
  }

  const IconComponent = forwardRef<ElementRef<typeof Svg>, IconProps>(
    ({ variant = defaultVariant, color = 'ink.action-primary-default', ...rest }, ref) => {
      const Component = icon[variant] ?? fallback;
      const theme = useTheme<Theme>();

      return (
        <Component
          ref={ref}
          width={iconSizeMap[variant]}
          height={iconSizeMap[variant]}
          color={theme.colors[color]}
          {...rest}
        />
      );
    }
  );

  IconComponent.displayName = displayName;

  return IconComponent;
}
