import { forwardRef } from 'react';

import HeadsetSmall from '../assets/icons/headset-16-16.svg';
import Headset from '../assets/icons/headset-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const HeadsetIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <HeadsetSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Headset />
    </Icon>
  );
});

HeadsetIcon.displayName = 'HeadsetIcon';
