import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import Sparkles from '../../assets/icons/account-avatars/sparkles-24-24.svg';
import { Icon } from '../icon/icon.native';

export const SparklesIcon = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Sparkles />
    </Icon>
  );
});
