import React, { forwardRef } from 'react';

import 'leather-styles/css';
import { ColorToken, token } from 'leather-styles/tokens';

import { IconSize, iconSizeMap } from './icon.shared';

export interface IconProps extends React.SVGProps<SVGSVGElement> {
  variant?: IconSize;
  color?: ColorToken;
}

interface CreateWebIconParams {
  displayName: string;
  icon: {
    small?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    medium?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    large?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  };
  defaultVariant?: IconSize;
}

export function createWebIcon({
  icon,
  displayName,
  defaultVariant = 'medium',
}: CreateWebIconParams) {
  const { small, medium, large } = icon;
  const fallback = small ?? medium ?? large;

  if (!fallback) {
    throw new Error(
      "Missing variant variant - at least one of: 'small', 'medium', 'large' should be specified."
    );
  }

  const IconComponent = forwardRef<SVGSVGElement, IconProps>(
    ({ variant = defaultVariant, color = 'ink.action-primary-default', ...rest }, ref) => {
      const Component = icon[variant] ?? fallback;

      return (
        <Component
          ref={ref}
          width={iconSizeMap[variant]}
          height={iconSizeMap[variant]}
          color={token(`colors.${color}`)}
          {...rest}
        />
      );
    }
  );

  IconComponent.displayName = displayName;

  return IconComponent;
}
