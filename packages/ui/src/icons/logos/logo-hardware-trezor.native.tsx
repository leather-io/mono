import { Component, forwardRef } from 'react';

import LogoHardwareTrezorLogo from '../../assets/icons/logos/logo-hardware-trezor-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const LogoHardwareTrezor = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <LogoHardwareTrezorLogo />
    </Icon>
  );
});
