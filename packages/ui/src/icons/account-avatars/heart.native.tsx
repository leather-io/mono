import { Component, forwardRef } from 'react';

import Heart from '../../assets/icons/account-avatars/heart-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const HeartIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Heart />
    </Icon>
  );
});
