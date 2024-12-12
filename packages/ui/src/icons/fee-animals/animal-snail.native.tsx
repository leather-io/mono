import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import AnimalSnail from '../../assets/icons/fee-animals/animal-snail-32-32.svg';
import { Icon } from '../icon/icon.native';

export const AnimalSnailIcon = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <AnimalSnail />
    </Icon>
  );
});
