import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import Gift from '../../assets/icons/account-avatars/gift-24-24.svg';
import { Icon } from '../icon/icon.native';

export const GiftIcon = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Gift />
    </Icon>
  );
});

GiftIcon.displayName = 'GiftIcon';
