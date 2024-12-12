import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import LogoHardwareRyderLogo from '../../assets/icons/logos/logo-hardware-ryder-24-24.svg';
import { Icon } from '../icon/icon.native';

export const LogoHardwareRyder = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <LogoHardwareRyderLogo />
    </Icon>
  );
});
