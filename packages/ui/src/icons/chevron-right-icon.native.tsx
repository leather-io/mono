import { Component, forwardRef } from 'react';

import ChevronRightSmall from '../assets/icons/chevron-right-16-16.svg';
import ChevronRight from '../assets/icons/chevron-right-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const ChevronRightIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <ChevronRightSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <ChevronRight />
    </Icon>
  );
});
