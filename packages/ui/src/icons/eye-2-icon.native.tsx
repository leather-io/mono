import { Component, forwardRef } from 'react';

import Eye2Small from '../assets/icons/eye-2-16-16.svg';
import Eye2 from '../assets/icons/eye-2-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const Eye2Icon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <Eye2Small />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <Eye2 />
    </Icon>
  );
});

Eye2Icon.displayName = 'Eye2Icon';
