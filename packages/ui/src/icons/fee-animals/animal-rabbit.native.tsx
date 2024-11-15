import { Component, forwardRef } from 'react';

import AnimalRabbit from '../../assets/icons/fee-animals/animal-rabbit-32-32.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const AnimalRabbitIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <AnimalRabbit />
    </Icon>
  );
});
