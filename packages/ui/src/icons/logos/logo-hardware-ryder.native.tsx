import { Component, forwardRef } from 'react';

import LogoHardwareRyderLogo from '../../assets/icons/logos/logo-hardware-ryder-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const LogoHardwareRyder = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <LogoHardwareRyderLogo />
    </Icon>
  );
});
