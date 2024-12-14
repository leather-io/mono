import { Component, forwardRef } from 'react';

import BitcoinCircleSmall from '../assets/icons/bitcoin-circle-16-16.svg';
import BitcoinCircle from '../assets/icons/bitcoin-circle-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const BitcoinCircleIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <BitcoinCircleSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <BitcoinCircle />
    </Icon>
  );
});

BitcoinCircleIcon.displayName = 'BitcoinCircleIcon';
