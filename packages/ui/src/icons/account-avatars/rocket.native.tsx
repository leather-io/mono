import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import Rocket from '../../assets/icons/account-avatars/rocket-24-24.svg';
import { Icon } from '../icon/icon.native';

export const RocketIcon = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Rocket />
    </Icon>
  );
});
