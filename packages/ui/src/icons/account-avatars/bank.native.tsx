import { Component, forwardRef } from 'react';
import { SvgProps } from 'react-native-svg';

import Bank from '../../assets/icons/account-avatars/bank-24-24.svg';
import { Icon } from '../icon/icon.native';

export const BankIcon = forwardRef<Component, SvgProps>((props, ref) => {
  return (
    <Icon ref={ref} {...props}>
      <Bank />
    </Icon>
  );
});
