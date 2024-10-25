import { forwardRef } from 'react';

import MoonSmall from '../assets/icons/moon-16-16.svg';
import Moon from '../assets/icons/moon-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const MoonIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <MoonSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Moon />
    </Icon>
  );
});
