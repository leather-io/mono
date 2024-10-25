import { Component, forwardRef } from 'react';

import Flag from '../../assets/icons/account-avatars/flag-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const FlagIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Flag />
    </Icon>
  );
});
