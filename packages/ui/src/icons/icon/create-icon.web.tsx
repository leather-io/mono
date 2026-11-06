import { type ComponentType, type SVGProps, forwardRef } from 'react';

import 'leather-styles/css';

import { type ColorToken, token } from 'leather-styles/tokens';

import { type IconSize, iconSizeMap } from './icon.shared';

export interface IconProps extends SVGProps<SVGSVGElement> {
  variant?: IconSize;
  color?: ColorToken;
}

interface CreateWebIconParams {
  displayName: string;
  icon: {
    small?: ComponentType<SVGProps<SVGSVGElement>>;
    medium?: ComponentType<SVGProps<SVGSVGElement>>;
    large?: ComponentType<SVGProps<SVGSVGElement>>;
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
      "Missing variant - at least one of: 'small', 'medium', 'large' should be specified."
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
