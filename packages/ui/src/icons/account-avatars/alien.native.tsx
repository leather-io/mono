import { Component, forwardRef } from 'react';

import Alien from '../../assets/icons/account-avatars/alien-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const AlienIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Alien />
    </Icon>
  );
});
