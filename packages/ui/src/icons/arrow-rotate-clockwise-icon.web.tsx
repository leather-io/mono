import { forwardRef } from 'react';

import ArrowRotateClockwiseSmall from '../assets/icons/arrow-rotate-clockwise-16-16.svg';
import ArrowRotateClockwise from '../assets/icons/arrow-rotate-clockwise-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const ArrowRotateClockwiseIcon = forwardRef<SVGSVGElement, IconProps>(
  ({ variant, ...props }, ref) => {
    if (variant === 'small')
      return (
        <Icon ref={ref} {...props}>
          <ArrowRotateClockwiseSmall />
        </Icon>
      );
    return (
      <Icon ref={ref} {...props}>
        <ArrowRotateClockwise />
      </Icon>
    );
  }
);
