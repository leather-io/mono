import BarsTwo16 from '../assets/icons/bars-two-16-16.svg';
import BarsTwo24 from '../assets/icons/bars-two-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const BarsTwoIcon = createWebIcon({
  icon: {
    small: BarsTwo16,
    medium: BarsTwo24,
  },
  displayName: 'BarsTwo',
});
