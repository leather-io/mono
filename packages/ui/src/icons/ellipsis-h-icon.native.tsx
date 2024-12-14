import { Component, forwardRef } from 'react';

import EllipsisHSmall from '../assets/icons/ellipsis-h-16-16.svg';
import EllipsisH from '../assets/icons/ellipsis-h-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const EllipsisHIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <EllipsisHSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <EllipsisH />
    </Icon>
  );
});

EllipsisHIcon.displayName = 'EllipsisHIcon';
