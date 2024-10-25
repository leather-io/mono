import { Component, forwardRef } from 'react';

import Piggybank from '../../assets/icons/account-avatars/piggybank-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const PiggybankIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Piggybank />
    </Icon>
  );
});
