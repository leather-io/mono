import BarsThree16 from '../assets/icons/bars-three-16-16.svg';
import BarsThree24 from '../assets/icons/bars-three-24-24.svg';
import { createNativeIcon } from './icon/create-icon.native';

export const BarsThreeIcon = createNativeIcon({
  icon: {
    small: BarsThree16,
    medium: BarsThree24,
  },
  displayName: 'BarsThree',
});
