import { Component, forwardRef } from 'react';

import ArrowTopBottomSmall from '../assets/icons/arrow-top-bottom-16-16.svg';
import ArrowTopBottom from '../assets/icons/arrow-top-bottom-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const ArrowTopBottomIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <ArrowTopBottomSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <ArrowTopBottom />
    </Icon>
  );
});
