import { Component, forwardRef } from 'react';

import DollarCircleSmall from '../assets/icons/dollar-circle-16-16.svg';
import DollarCircle from '../assets/icons/dollar-circle-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const DollarCircleIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <DollarCircleSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <DollarCircle />
    </Icon>
  );
});
