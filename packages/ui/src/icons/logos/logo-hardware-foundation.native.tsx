import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import LogoHardwareFoundationLogo from '../../assets/icons/logos/logo-hardware-foundation-24-24.svg';
import { Icon } from '../icon/icon.native';

export const LogoHardwareFoundation = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <LogoHardwareFoundationLogo />
    </Icon>
  );
});

LogoHardwareFoundation.displayName = 'LogoHardwareFoundation';
