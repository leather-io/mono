import { Component, forwardRef } from 'react';

import UsersTwoSmall from '../assets/icons/users-two-16-16.svg';
import UsersTwo from '../assets/icons/users-two-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const UsersTwoIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <UsersTwoSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <UsersTwo />
    </Icon>
  );
});

UsersTwoIcon.displayName = 'UsersTwoIcon';
