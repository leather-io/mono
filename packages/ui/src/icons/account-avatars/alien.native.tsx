import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import Alien from '../../assets/icons/account-avatars/alien-24-24.svg';
import { Icon } from '../icon/icon.native';

export const AlienIcon = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Alien />
    </Icon>
  );
});

AlienIcon.displayName = 'AlienIcon';
