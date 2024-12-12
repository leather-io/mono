import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import Flag from '../../assets/icons/account-avatars/flag-24-24.svg';
import { Icon } from '../icon/icon.native';

export const FlagIcon = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Flag />
    </Icon>
  );
});
