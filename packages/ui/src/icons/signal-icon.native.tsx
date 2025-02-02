import Signal16 from '../assets/icons/signal-16-16.svg';
import Signal24 from '../assets/icons/signal-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const SignalIcon = createNativeIcon({
  icon: {
    small: Signal16,
    medium: Signal24,
  },
  displayName: 'Signal',
});
