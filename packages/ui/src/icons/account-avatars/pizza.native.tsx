import { Component, forwardRef } from 'react';

import Pizza from '../../assets/icons/account-avatars/pizza-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const PizzaIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Pizza />
    </Icon>
  );
});
