import { Component, forwardRef } from 'react';

import EmailSmall from '../assets/icons/email-16-16.svg';
import Email from '../assets/icons/email-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const EmailIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <EmailSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Email />
    </Icon>
  );
});
