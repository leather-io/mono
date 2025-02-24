import BarsThree16 from '../assets/icons/bars-three-16-16.svg';
import BarsThree24 from '../assets/icons/bars-three-24-24.svg';
import { createWebIcon } from './icon/create-icon.web';

export const BarsThreeIcon = createWebIcon({
  icon: {
    small: BarsThree16,
    medium: BarsThree24,
  },
  displayName: 'BarsThree',
});
