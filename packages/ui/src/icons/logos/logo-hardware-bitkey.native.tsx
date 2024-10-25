import { Component, forwardRef } from 'react';

import LogoHardwareBitkeyLogo from '../../assets/icons/logos/logo-hardware-bitkey-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const LogoHardwareBitkey = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <LogoHardwareBitkeyLogo />
    </Icon>
  );
});
