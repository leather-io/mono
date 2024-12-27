import { Component, forwardRef } from 'react';

import NumberedListSmall from '../assets/icons/numbered-list-16-16.svg';
import NumberedList from '../assets/icons/numbered-list-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const NumberedListIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <NumberedListSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <NumberedList />
    </Icon>
  );
});
