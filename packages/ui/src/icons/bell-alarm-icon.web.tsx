import BellAlarm16 from '../assets/icons/bell-alarm-16-16.svg';
import BellAlarm24 from '../assets/icons/bell-alarm-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const BellAlarmIcon = createWebIcon({
  icon: {
    small: BellAlarm16,
    medium: BellAlarm24,
  },
  displayName: 'BellAlarm',
});
