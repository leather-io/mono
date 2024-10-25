import { Component, forwardRef } from 'react';

import ReloadSmall from '../assets/icons/arrow-rotate-clockwise-16-16.svg';
import Reload from '../assets/icons/arrow-rotate-clockwise-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const ArrowRotateClockwiseIcon = forwardRef<Component, IconProps>(
  ({ variant, ...props }, ref) => {
    if (variant === 'small')
      return (
        <Icon ref={ref} {...props}>
          <ReloadSmall />
        </Icon>
      );
    return (
      <Icon ref={ref} {...props}>
        <Reload />
      </Icon>
    );
  }
);
