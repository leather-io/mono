import { forwardRef } from 'react';

import CheckmarkSmall from '../assets/icons/checkmark-16-16.svg';
import Checkmark from '../assets/icons/checkmark-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const CheckmarkIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <CheckmarkSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Checkmark />
    </Icon>
  );
});

CheckmarkIcon.displayName = 'CheckmarkIcon';
