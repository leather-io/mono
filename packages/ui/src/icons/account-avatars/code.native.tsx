import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import Code from '../../assets/icons/account-avatars/code-24-24.svg';
import { Icon } from '../icon/icon.native';

export const CodeIcon = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Code />
    </Icon>
  );
});

CodeIcon.displayName = 'CodeIcon';
