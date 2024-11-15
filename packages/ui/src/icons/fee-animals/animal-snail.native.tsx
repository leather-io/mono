import { Component, forwardRef } from 'react';

import AnimalSnail from '../../assets/icons/fee-animals/animal-snail-32-32.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const AnimalSnailIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <AnimalSnail />
    </Icon>
  );
});
