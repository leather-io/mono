import { Component, forwardRef } from 'react';

import CookieSmall from '../assets/icons/cookie-16-16.svg';
import Cookie from '../assets/icons/cookie-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const CookieIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <CookieSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Cookie />
    </Icon>
  );
});

CookieIcon.displayName = 'CookieIcon';
