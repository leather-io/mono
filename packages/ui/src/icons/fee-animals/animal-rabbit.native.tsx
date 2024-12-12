import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import AnimalRabbit from '../../assets/icons/fee-animals/animal-rabbit-32-32.svg';
import { Icon } from '../icon/icon.native';

export const AnimalRabbitIcon = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <AnimalRabbit />
    </Icon>
  );
});
