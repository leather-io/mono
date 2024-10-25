import { Component, forwardRef } from 'react';

import Smile from '../../assets/icons/account-avatars/smile-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const SmileIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Smile />
    </Icon>
  );
});
