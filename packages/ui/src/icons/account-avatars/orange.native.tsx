import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import Orange from '../../assets/icons/account-avatars/orange-24-24.svg';
import { Icon } from '../icon/icon.native';

export const OrangeIcon = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Orange />
    </Icon>
  );
});

OrangeIcon.displayName = 'OrangeIcon';
