import { forwardRef } from 'react';

import UserSmall from '../assets/icons/user-16-16.svg';
import User from '../assets/icons/user-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const UserIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <UserSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <User />
    </Icon>
  );
});
