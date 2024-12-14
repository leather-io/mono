import { Component, forwardRef } from 'react';

import ChevronUpSmall from '../assets/icons/chevron-up-16-16.svg';
import ChevronUp from '../assets/icons/chevron-up-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const ChevronUpIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <ChevronUpSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <ChevronUp />
    </Icon>
  );
});

ChevronUpIcon.displayName = 'ChevronUpIcon';
