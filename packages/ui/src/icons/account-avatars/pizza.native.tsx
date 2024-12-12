import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import Pizza from '../../assets/icons/account-avatars/pizza-24-24.svg';
import { Icon } from '../icon/icon.native';

export const PizzaIcon = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Pizza />
    </Icon>
  );
});
