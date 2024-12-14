import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import LogoMpcFordefiLogo from '../../assets/icons/logos/logo-mpc-fordefi-24-24.svg';
import { Icon } from '../icon/icon.native';

export const LogoMpcFordefi = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <LogoMpcFordefiLogo />
    </Icon>
  );
});

LogoMpcFordefi.displayName = 'LogoMpcFordefi';
