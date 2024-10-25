import { Component, forwardRef } from 'react';

import Saturn from '../../assets/icons/account-avatars/saturn-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const SaturnIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Saturn />
    </Icon>
  );
});
