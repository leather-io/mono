import { Component, forwardRef } from 'react';

import BellSmall from '../assets/icons/bell-16-16.svg';
import Bell from '../assets/icons/bell-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const BellIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <BellSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Bell />
    </Icon>
  );
});
