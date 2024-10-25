import { Component, forwardRef } from 'react';

import LogoMpcBitgoLogo from '../../assets/icons/logos/logo-mpc-bitgo-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const LogoMpcBitgo = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <LogoMpcBitgoLogo />
    </Icon>
  );
});
