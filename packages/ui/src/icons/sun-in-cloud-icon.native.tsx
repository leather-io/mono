import { Component, forwardRef } from 'react';

import SunInCloudSmall from '../assets/icons/sun-in-cloud-16-16.svg';
import SunInCloud from '../assets/icons/sun-in-cloud-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const SunInCloudIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
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
