import { Component, forwardRef } from 'react';

import SquareNotificationSmall from '../assets/icons/square-notification-16-16.svg';
import SquareNotification from '../assets/icons/square-notification-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const SquareNotificationIcon = forwardRef<Component, IconProps>(
  ({ variant, ...props }, ref) => {
    if (variant === 'small')
      return (
        <Icon ref={ref} {...props}>
          <SquareNotificationSmall />
        </Icon>
      );
    return (
      <Icon ref={ref} {...props}>
        <SquareNotification />
      </Icon>
    );
  }
);
