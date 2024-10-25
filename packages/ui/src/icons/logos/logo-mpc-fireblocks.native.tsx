import { Component, forwardRef } from 'react';

import LogoMpcFireblocksLogo from '../../assets/icons/logos/logo-mpc-fireblocks-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const LogoMpcFireblocks = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <LogoMpcFireblocksLogo />
    </Icon>
  );
});
