import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import LogoMpcPortalLogo from '../../assets/icons/logos/logo-mpc-portal-24-24.svg';
import { Icon } from '../icon/icon.native';

export const LogoMpcPortal = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <LogoMpcPortalLogo />
    </Icon>
  );
});

LogoMpcPortal.displayName = 'LogoMpcPortal';
