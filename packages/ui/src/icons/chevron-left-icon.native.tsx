import { Component, forwardRef } from 'react';

import ChevronLeftSmall from '../assets/icons/chevron-left-16-16.svg';
import ChevronLeft from '../assets/icons/chevron-left-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const ChevronLeftIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <ChevronLeftSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <ChevronLeft />
    </Icon>
  );
});

ChevronLeftIcon.displayName = 'ChevronLeftIcon';
