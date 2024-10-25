import { forwardRef } from 'react';

import SunSmall from '../assets/icons/sun-16-16.svg';
import Sun from '../assets/icons/sun-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const SunIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <SunSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Sun />
    </Icon>
  );
});
