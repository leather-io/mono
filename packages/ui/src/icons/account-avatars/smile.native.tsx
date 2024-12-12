import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import Smile from '../../assets/icons/account-avatars/smile-24-24.svg';
import { Icon } from '../icon/icon.native';

export const SmileIcon = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Smile />
    </Icon>
  );
});
