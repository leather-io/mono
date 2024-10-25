import { forwardRef } from 'react';

import BitcoinSmall from '../assets/icons/bitcoin-16-16.svg';
import Bitcoin from '../assets/icons/bitcoin-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const BitcoinIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <BitcoinSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Bitcoin />
    </Icon>
  );
});
