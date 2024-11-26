import { Component, forwardRef } from 'react';

import ArrowDownSmall from '../assets/icons/arrow-down-16-16.svg';
import ArrowDown from '../assets/icons/arrow-down-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const ArrowDownIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <ArrowDownSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <ArrowDown />
    </Icon>
  );
});
