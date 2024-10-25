import { Component, forwardRef } from 'react';

import WalletPlusSmall from '../assets/icons/wallet-plus-16-16.svg';
import WalletPlus from '../assets/icons/wallet-plus-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const WalletPlusIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <WalletPlusSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <WalletPlus />
    </Icon>
  );
});
