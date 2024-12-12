import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import AnimalChameleon from '../../assets/icons/fee-animals/animal-chameleon-32-32.svg';
import { Icon } from '../icon/icon.native';

export const AnimalChameleonIcon = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <AnimalChameleon />
    </Icon>
  );
});
