import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import XLogo from '../assets/icons/x-logo.svg';
import { Icon } from './icon/icon.native';

export const XLogoIcon = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <XLogo />
    </Icon>
  );
});
