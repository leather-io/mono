import { forwardRef } from 'react';

import LockSmall from '../assets/icons/lock-16-16.svg';
import Lock from '../assets/icons/lock-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const LockIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <LockSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Lock />
    </Icon>
  );
});
