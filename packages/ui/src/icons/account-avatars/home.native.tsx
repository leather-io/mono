import { Component, forwardRef } from 'react';

import Home from '../../assets/icons/account-avatars/home-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const HomeIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Home />
    </Icon>
  );
});
