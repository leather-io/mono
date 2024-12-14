import { forwardRef } from 'react';

import CircleSmall from '../assets/icons/circle-16-16.svg';
import Circle from '../assets/icons/circle-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const CircleIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <CircleSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Circle />
    </Icon>
  );
});

CircleIcon.displayName = 'CircleIcon';
