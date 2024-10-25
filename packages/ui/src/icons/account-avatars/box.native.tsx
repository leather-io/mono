import { Component, forwardRef } from 'react';

import Box from '../../assets/icons/account-avatars/box-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const BoxIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Box />
    </Icon>
  );
});
