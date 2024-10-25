import { Component, forwardRef } from 'react';

import Zap from '../../assets/icons/account-avatars/zap-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const ZapIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Zap />
    </Icon>
  );
});
