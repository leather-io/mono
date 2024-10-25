import { Component, forwardRef } from 'react';

import Rocket from '../../assets/icons/account-avatars/rocket-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const RocketIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Rocket />
    </Icon>
  );
});
