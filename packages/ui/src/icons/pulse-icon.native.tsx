import { Component, forwardRef } from 'react';

import PulseSmall from '../assets/icons/pulse-16-16.svg';
import Pulse from '../assets/icons/pulse-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const PulseIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <PulseSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Pulse />
    </Icon>
  );
});
