import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import LeatherLogomark from '../assets/icons/leather-logomark.svg';
import { Icon } from './icon/icon.native';

export const LeatherLogomarkIcon = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <LeatherLogomark />
    </Icon>
  );
});

LeatherLogomarkIcon.displayName = 'LeatherLogomarkIcon';
