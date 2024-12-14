import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import LogoHardwareTrezorLogo from '../../assets/icons/logos/logo-hardware-trezor-24-24.svg';
import { Icon } from '../icon/icon.native';

export const LogoHardwareTrezor = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <LogoHardwareTrezorLogo />
    </Icon>
  );
});

LogoHardwareTrezor.displayName = 'LogoHardwareTrezor';
