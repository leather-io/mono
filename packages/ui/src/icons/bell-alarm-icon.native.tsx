import BellAlarmSmall from '../assets/icons/bell-alarm-16-16.svg';
import BellAlarm from '../assets/icons/bell-alarm-24-24.svg';
import { Icon, IconProps } from './icon/icon.native';

export function BellAlarmIcon({ variant, ...props }: IconProps) {
  if (variant === 'small')
    return (
      <Icon {...props}>
        <BellAlarmSmall />
      </Icon>
    );
  return (
    <Icon {...props}>
      <BellAlarm />
    </Icon>
  );
}
