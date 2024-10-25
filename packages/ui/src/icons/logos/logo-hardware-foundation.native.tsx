import { Component, forwardRef } from 'react';

import LogoHardwareFoundationLogo from '../../assets/icons/logos/logo-hardware-foundation-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const LogoHardwareFoundation = forwardRef<Component, IconProps>(
  ({ variant, ...props }, ref) => {
    return (
      <Icon ref={ref} {...props}>
        <LogoHardwareFoundationLogo />
      </Icon>
    );
  }
);
