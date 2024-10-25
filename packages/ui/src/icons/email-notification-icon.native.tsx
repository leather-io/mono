import { Component, forwardRef } from 'react';

import EmailNotificationSmall from '../assets/icons/email-notification-16-16.svg';
import EmailNotification from '../assets/icons/email-notification-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const EmailNotificationIcon = forwardRef<Component, IconProps>(
  ({ variant, ...props }, ref) => {
    if (variant === 'small')
      return (
        <Icon ref={ref} {...props}>
          <EmailNotificationSmall />
        </Icon>
      );
    return (
      <Icon ref={ref} {...props}>
        <EmailNotification />
      </Icon>
    );
  }
);
