import { forwardRef } from 'react';

import ZapSmall from '../assets/icons/zap-16-16.svg';
import Zap from '../assets/icons/zap-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const ZapIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <ZapSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Zap />
    </Icon>
  );
});

ZapIcon.displayName = 'ZapIcon';
