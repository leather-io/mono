import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import Space from '../../assets/icons/account-avatars/space-24-24.svg';
import { Icon } from '../icon/icon.native';

export const SpaceIcon = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Space />
    </Icon>
  );
});

SpaceIcon.displayName = 'SpaceIcon';
