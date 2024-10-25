import { Component, forwardRef } from 'react';

import LogoMpcPrivyLogo from '../../assets/icons/logos/logo-mpc-privy-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const LogoMpcPrivy = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <LogoMpcPrivyLogo />
    </Icon>
  );
});
