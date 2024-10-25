import { Component, forwardRef } from 'react';

import Gift from '../../assets/icons/account-avatars/gift-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const GiftIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Gift />
    </Icon>
  );
});
