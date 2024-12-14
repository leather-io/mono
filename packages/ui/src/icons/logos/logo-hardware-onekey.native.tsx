import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import LogoHardwareOnekeyLogo from '../../assets/icons/logos/logo-hardware-onekey-24-24.svg';
import { Icon } from '../icon/icon.native';

export const LogoHardwareOnekey = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <LogoHardwareOnekeyLogo />
    </Icon>
  );
});

LogoHardwareOnekey.displayName = 'LogoHardwareOnekey';
