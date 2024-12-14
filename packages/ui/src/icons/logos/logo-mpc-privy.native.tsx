import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import LogoMpcPrivyLogo from '../../assets/icons/logos/logo-mpc-privy-24-24.svg';
import { Icon } from '../icon/icon.native';

export const LogoMpcPrivy = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <LogoMpcPrivyLogo />
    </Icon>
  );
});

LogoMpcPrivy.displayName = 'LogoMpcPrivy';
