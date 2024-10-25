import { forwardRef } from 'react';

import ArrowUpSmall from '../assets/icons/arrow-up-16-16.svg';
import ArrowUp from '../assets/icons/arrow-up-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const ArrowUpIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <ArrowUpSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <ArrowUp />
    </Icon>
  );
});
