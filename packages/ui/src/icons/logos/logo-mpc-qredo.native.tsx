import { Component, forwardRef } from 'react';

import LogoMpcQredoLogo from '../../assets/icons/logos/logo-mpc-qredo-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const LogoMpcQredo = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <LogoMpcQredoLogo />
    </Icon>
  );
});
