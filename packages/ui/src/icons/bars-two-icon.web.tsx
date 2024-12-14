import { forwardRef } from 'react';

import BarsTwoSmall from '../assets/icons/bars-two-16-16.svg';
import BarsTwo from '../assets/icons/bars-two-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const BarsTwoIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <BarsTwoSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <BarsTwo />
    </Icon>
  );
});

BarsTwoIcon.displayName = 'BarsTwoIcon';
