import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import LeatherLettermark from '../assets/icons/leather-lettermark-24-24.svg';
import { Icon } from './icon/icon.native';

export const LeatherLettermarkIcon = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <LeatherLettermark />
    </Icon>
  );
});
