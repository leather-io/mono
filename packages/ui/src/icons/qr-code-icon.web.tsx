import { forwardRef } from 'react';

import QrCodeSmall from '../assets/icons/qr-code-16-16.svg';
import QrCode from '../assets/icons/qr-code-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const QrCodeIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <QrCodeSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <QrCode />
    </Icon>
  );
});

QrCodeIcon.displayName = 'QrCodeIcon';
