import { Component, forwardRef } from 'react';

import Space from '../../assets/icons/account-avatars/space-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const SpaceIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Space />
    </Icon>
  );
});
