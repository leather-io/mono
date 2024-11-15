import { Component, forwardRef } from 'react';

import AnimalChameleon from '../../assets/icons/fee-animals/animal-chameleon-32-32.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const AnimalChameleonIcon = forwardRef<Component, IconProps>(
  ({ variant, ...props }, ref) => {
    return (
      <Icon ref={ref} {...props}>
        <AnimalChameleon />
      </Icon>
    );
  }
);
