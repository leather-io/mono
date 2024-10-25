import { Component, forwardRef } from 'react';

import XLogo from '../assets/icons/x-logo.svg';
import { Icon, IconProps } from './icon/icon.native';

export const XLogoIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <XLogo />
    </Icon>
  );
});
