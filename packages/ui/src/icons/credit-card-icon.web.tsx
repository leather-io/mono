import { forwardRef } from 'react';

import CreditCardSmall from '../assets/icons/credit-card-16-16.svg';
import CreditCard from '../assets/icons/credit-card-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const CreditCardIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <CreditCardSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <CreditCard />
    </Icon>
  );
});

CreditCardIcon.displayName = 'CreditCardIcon';
