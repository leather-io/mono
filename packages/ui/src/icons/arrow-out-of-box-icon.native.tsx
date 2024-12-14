import { Component, forwardRef } from 'react';

import ArrowOutOfBoxSmall from '../assets/icons/arrow-out-of-box-16-16.svg';
import ArrowOutOfBox from '../assets/icons/arrow-out-of-box-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const ArrowOutOfBoxIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <ArrowOutOfBoxSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <ArrowOutOfBox />
    </Icon>
  );
});

ArrowOutOfBoxIcon.displayName = 'ArrowOutOfBoxIcon';
