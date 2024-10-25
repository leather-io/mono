import { Component, forwardRef } from 'react';

import LogoMpcCapsuleLogo from '../../assets/icons/logos/logo-mpc-capsule-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const LogoMpcCapsule = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <LogoMpcCapsuleLogo />
    </Icon>
  );
});
