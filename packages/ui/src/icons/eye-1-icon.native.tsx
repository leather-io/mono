import { Component, forwardRef } from 'react';

import Eye1Small from '../assets/icons/eye-1-16-16.svg';
import Eye1 from '../assets/icons/eye-1-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const Eye1Icon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <Eye1Small />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Eye1 />
    </Icon>
  );
});

Eye1Icon.displayName = 'Eye1Icon';
