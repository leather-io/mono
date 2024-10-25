import { Component, forwardRef } from 'react';

import LogoMpcFordefiLogo from '../../assets/icons/logos/logo-mpc-fordefi-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const LogoMpcFordefi = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <LogoMpcFordefiLogo />
    </Icon>
  );
});
