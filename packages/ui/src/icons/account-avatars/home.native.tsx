import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import Home from '../../assets/icons/account-avatars/home-24-24.svg';
import { Icon } from '../icon/icon.native';

export const HomeIcon = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Home />
    </Icon>
  );
});

HomeIcon.displayName = 'HomeIcon';
