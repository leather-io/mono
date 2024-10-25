import { forwardRef } from 'react';

import ErrorCircleSmall from '../assets/icons/error-circle-16-16.svg';
import ErrorCircle from '../assets/icons/error-circle-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const ErrorCircleIcon = forwardRef<SVGSVGElement, IconProps>(
  ({ variant, ...props }, ref) => {
    if (variant === 'small')
      return (
        <Icon ref={ref} {...props}>
          <ErrorCircleSmall />
        </Icon>
      );
    return (
      <Icon ref={ref} {...props}>
        <ErrorCircle />
      </Icon>
    );
  }
);
