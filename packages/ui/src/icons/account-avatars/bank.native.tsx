import { Component, forwardRef } from 'react';

import Bank from '../../assets/icons/account-avatars/bank-24-24.svg';
import { Icon, IconProps } from '../icon/icon.native';

export const BankIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Bank />
    </Icon>
  );
});
