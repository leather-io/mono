import { Component, forwardRef } from 'react';

import UserSmall from '../assets/icons/user-16-16.svg';
import User from '../assets/icons/user-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const UserIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
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

UserIcon.displayName = 'UserIcon';
