import { Component, forwardRef } from 'react';

import CloudOffSmall from '../assets/icons/cloud-off-16-16.svg';
import CloudOff from '../assets/icons/cloud-off-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const CloudOffIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
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
