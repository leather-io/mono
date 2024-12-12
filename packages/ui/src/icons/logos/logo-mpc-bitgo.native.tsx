import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import LogoMpcBitgoLogo from '../../assets/icons/logos/logo-mpc-bitgo-24-24.svg';
import { Icon } from '../icon/icon.native';

export const LogoMpcBitgo = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <LogoMpcBitgoLogo />
    </Icon>
  );
});
