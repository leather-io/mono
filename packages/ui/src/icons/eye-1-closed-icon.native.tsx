import { Component, forwardRef } from 'react';

import Eye1ClosedSmall from '../assets/icons/eye-1-closed-16-16.svg';
import Eye1Closed from '../assets/icons/eye-1-closed-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const Eye1ClosedIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <Eye1ClosedSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Eye1Closed />
    </Icon>
  );
});

Eye1ClosedIcon.displayName = 'Eye1ClosedIcon';
