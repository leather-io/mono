import { forwardRef } from 'react';

import LedgerSmall from '../assets/icons/ledger-16-16.svg';
import Ledger from '../assets/icons/ledger-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const LedgerIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <LedgerSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Ledger />
    </Icon>
  );
});
