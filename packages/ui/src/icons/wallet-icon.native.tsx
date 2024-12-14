import { Component, forwardRef } from 'react';

import WalletSmall from '../assets/icons/wallet-16-16.svg';
import Wallet from '../assets/icons/wallet-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const WalletIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <WalletSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Wallet />
    </Icon>
  );
});

WalletIcon.displayName = 'WalletIcon';
