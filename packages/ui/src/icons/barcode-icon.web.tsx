import { forwardRef } from 'react';

import BarcodeSmall from '../assets/icons/barcode-16-16.svg';
import Barcode from '../assets/icons/barcode-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const BarcodeIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <BarcodeSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Barcode />
    </Icon>
  );
});

BarcodeIcon.displayName = 'BarcodeIcon';
