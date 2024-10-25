import { Component, forwardRef } from 'react';

import Car from '../../assets/icons/account-avatars/car-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const CarIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Car />
    </Icon>
  );
});
