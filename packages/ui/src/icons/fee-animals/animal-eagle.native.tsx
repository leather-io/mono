import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import AnimalEagle from '../../assets/icons/fee-animals/animal-eagle-32-32.svg';
import { Icon } from '../icon/icon.native';

export const AnimalEagleIcon = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <AnimalEagle />
    </Icon>
  );
});

AnimalEagleIcon.displayName = 'AnimalEagleIcon';
