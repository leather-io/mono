import { forwardRef } from 'react';

import SunInCloudSmall from '../assets/icons/sun-in-cloud-16-16.svg';
import SunInCloud from '../assets/icons/sun-in-cloud-24-24.svg';
import { Icon, IconProps } from './icon/icon.web';

export const SunInCloudIcon = forwardRef<SVGSVGElement, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <SunInCloudSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <SunInCloud />
    </Icon>
  );
});

SunInCloudIcon.displayName = 'SunInCloudIcon';
