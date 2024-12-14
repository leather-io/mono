import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import Car from '../../assets/icons/account-avatars/car-24-24.svg';
import { Icon } from '../icon/icon.native';

export const CarIcon = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Car />
    </Icon>
  );
});

CarIcon.displayName = 'CarIcon';
