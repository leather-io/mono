import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import LogoMpcCopperLogo from '../../assets/icons/logos/logo-mpc-copper-24-24.svg';
import { Icon } from '../icon/icon.native';

export const LogoMpcCopper = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <LogoMpcCopperLogo />
    </Icon>
  );
});

LogoMpcCopper.displayName = 'LogoMpcCopper';
