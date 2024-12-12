import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import Piggybank from '../../assets/icons/account-avatars/piggybank-24-24.svg';
import { Icon } from '../icon/icon.native';

export const PiggybankIcon = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Piggybank />
    </Icon>
  );
});
