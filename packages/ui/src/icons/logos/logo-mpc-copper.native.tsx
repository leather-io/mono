import { Component, forwardRef } from 'react';

import LogoMpcCopperLogo from '../../assets/icons/logos/logo-mpc-copper-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const LogoMpcCopper = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <LogoMpcCopperLogo />
    </Icon>
  );
});
