import { Component, forwardRef } from 'react';

import BellAlarmSmall from '../assets/icons/bell-alarm-16-16.svg';
import BellAlarm from '../assets/icons/bell-alarm-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export const BellAlarmIcon = forwardRef<Component, IconProps>(({ variant, ...props }, ref) => {
  if (variant === 'small')
    return (
      <Icon ref={ref} {...props}>
        <BellAlarmSmall />
      </Icon>
    );
  return (
    <Icon ref={ref} {...props}>
      <BellAlarm />
    </Icon>
  );
});
