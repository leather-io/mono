import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import LogoHardwareLedgerLogo from '../../assets/icons/logos/logo-hardware-ledger-24-24.svg';
import { Icon } from '../icon/icon.native';

export const LogoHardwareLedger = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <LogoHardwareLedgerLogo />
    </Icon>
  );
});

LogoHardwareLedger.displayName = 'LogoHardwareLedger';
