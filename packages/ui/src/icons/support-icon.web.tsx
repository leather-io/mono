import { forwardRef } from 'react';

import SupportSmall from '../assets/icons/support-16-16.svg';
import Support from '../assets/icons/support-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const SupportIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <SupportSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Support />
    </Icon>
  );
});
