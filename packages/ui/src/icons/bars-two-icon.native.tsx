import BarsTwo16 from '../assets/icons/bars-two-16-16.svg';
import BarsTwo24 from '../assets/icons/bars-two-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const BarsTwoIcon = createNativeIcon({
  icon: {
    small: BarsTwo16,
    medium: BarsTwo24,
  },
  displayName: 'BarsTwo',
});
