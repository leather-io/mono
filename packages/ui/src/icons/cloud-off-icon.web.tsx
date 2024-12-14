import { forwardRef } from 'react';

import CloudOffSmall from '../assets/icons/cloud-off-16-16.svg';
import CloudOff from '../assets/icons/cloud-off-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const CloudOffIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <CloudOffSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <CloudOff />
    </Icon>
  );
});

CloudOffIcon.displayName = 'CloudOffIcon';
