import { Component, forwardRef } from 'react';

import Sparkles from '../../assets/icons/account-avatars/sparkles-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const SparklesIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Sparkles />
    </Icon>
  );
});
