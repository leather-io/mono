import { Component, forwardRef } from 'react';

import ShieldSmall from '../assets/icons/shield-16-16.svg';
import Shield from '../assets/icons/shield-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const ShieldIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <ShieldSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Shield />
    </Icon>
  );
});

ShieldIcon.displayName = 'ShieldIcon';
