import { forwardRef } from 'react';

import UnlockSmall from '../assets/icons/unlock-16-16.svg';
import Unlock from '../assets/icons/unlock-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const UnlockIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <UnlockSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Unlock />
    </Icon>
  );
});

UnlockIcon.displayName = 'UnlockIcon';
