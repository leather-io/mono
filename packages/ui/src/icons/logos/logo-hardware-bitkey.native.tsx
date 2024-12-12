import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import LogoHardwareBitkeyLogo from '../../assets/icons/logos/logo-hardware-bitkey-24-24.svg';
import { Icon } from '../icon/icon.native';

export const LogoHardwareBitkey = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <LogoHardwareBitkeyLogo />
    </Icon>
  );
});
