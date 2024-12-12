import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import LogoMpcFireblocksLogo from '../../assets/icons/logos/logo-mpc-fireblocks-24-24.svg';
import { Icon } from '../icon/icon.native';

export const LogoMpcFireblocks = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <LogoMpcFireblocksLogo />
    </Icon>
  );
});
