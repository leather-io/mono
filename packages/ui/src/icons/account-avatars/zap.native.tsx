import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import Zap from '../../assets/icons/account-avatars/zap-24-24.svg';
import { Icon } from '../icon/icon.native';

export const ZapIcon = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Zap />
    </Icon>
  );
});
