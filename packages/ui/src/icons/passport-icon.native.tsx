import { Component, forwardRef } from 'react';

import PassportSmall from '../assets/icons/passport-16-16.svg';
import Passport from '../assets/icons/passport-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const PassportIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <PassportSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Passport />
    </Icon>
  );
});
