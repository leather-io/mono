import { forwardRef } from 'react';

import ArrowRotateRightLeftSmall from '../assets/icons/arrow-rotate-right-left-16-16.svg';
import ArrowRotateRightLeft from '../assets/icons/arrow-rotate-right-left-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const ArrowRotateRightLeftIcon = forwardRef<SVGSVGElement, IconProps>(
  ({ variant, ...props }, ref) => {
    if (variant === 'small')
      return (
        <Icon ref={ref} {...props}>
          <ArrowRotateRightLeftSmall />
        </Icon>
      );
    return (
      <Icon ref={ref} {...props}>
        <ArrowRotateRightLeft />
      </Icon>
    );
  }
);

ArrowRotateRightLeftIcon.displayName = 'ArrowRotateRightLeftIcon';
