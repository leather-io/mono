import { forwardRef } from 'react';

import CheckmarkCircleSmall from '../assets/icons/checkmark-circle-16-16.svg';
import CheckmarkCircle from '../assets/icons/checkmark-circle-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const CheckmarkCircleIcon = forwardRef<SVGSVGElement, IconProps>(
  ({ variant, ...props }, ref) => {
    if (variant === 'small')
      return (
        <Icon ref={ref} {...props}>
          <CheckmarkCircleSmall />
        </Icon>
      );
    return (
      <Icon ref={ref} {...props}>
        <CheckmarkCircle />
      </Icon>
    );
  }
);

CheckmarkCircleIcon.displayName = 'CheckmarkCircleIcon';
