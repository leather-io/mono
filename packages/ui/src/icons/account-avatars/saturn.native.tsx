import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import Saturn from '../../assets/icons/account-avatars/saturn-24-24.svg';
import { Icon } from '../icon/icon.native';

export const SaturnIcon = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Saturn />
    </Icon>
  );
});

SaturnIcon.displayName = 'SaturnIcon';
