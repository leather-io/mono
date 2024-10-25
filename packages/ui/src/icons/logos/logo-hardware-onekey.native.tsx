import { Component, forwardRef } from 'react';

import LogoHardwareOnekeyLogo from '../../assets/icons/logos/logo-hardware-onekey-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const LogoHardwareOnekey = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <LogoHardwareOnekeyLogo />
    </Icon>
  );
});
