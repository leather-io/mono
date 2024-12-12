import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import Heart from '../../assets/icons/account-avatars/heart-24-24.svg';
import { Icon } from '../icon/icon.native';

export const HeartIcon = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Heart />
    </Icon>
  );
});
