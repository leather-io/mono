import { Component, forwardRef } from 'react';

import HeadsetSmall from '../assets/icons/headset-16-16.svg';
import Headset from '../assets/icons/headset-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const HeadsetIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
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
