import { Component, forwardRef } from 'react';

import LogoHardwareLedgerLogo from '../../assets/icons/logos/logo-hardware-ledger-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const LogoHardwareLedger = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <LogoHardwareLedgerLogo />
    </Icon>
  );
});
