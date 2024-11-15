import { Component, forwardRef } from 'react';

import AnimalEagle from '../../assets/icons/fee-animals/animal-eagle-32-32.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const AnimalEagleIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <AnimalEagle />
    </Icon>
  );
});
