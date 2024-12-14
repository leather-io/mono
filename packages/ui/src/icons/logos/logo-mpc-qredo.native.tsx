import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import LogoMpcQredoLogo from '../../assets/icons/logos/logo-mpc-qredo-24-24.svg';
import { Icon } from '../icon/icon.native';

export const LogoMpcQredo = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <LogoMpcQredoLogo />
    </Icon>
  );
});

LogoMpcQredo.displayName = 'LogoMpcQredo';
