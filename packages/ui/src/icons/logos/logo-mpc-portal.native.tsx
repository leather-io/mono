import { Component, forwardRef } from 'react';

import LogoMpcPortalLogo from '../../assets/icons/logos/logo-mpc-portal-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const LogoMpcPortal = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <LogoMpcPortalLogo />
    </Icon>
  );
});
