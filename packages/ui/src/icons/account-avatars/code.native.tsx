import { Component, forwardRef } from 'react';

import Code from '../../assets/icons/account-avatars/code-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const CodeIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Code />
    </Icon>
  );
});
