import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import Box from '../../assets/icons/account-avatars/box-24-24.svg';
import { Icon } from '../icon/icon.native';

export const BoxIcon = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Box />
    </Icon>
  );
});

BoxIcon.displayName = 'BoxIcon';
