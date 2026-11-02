import { Platform } from 'react-native';

import adaptiveIcon1Image from '../../../assets/adaptive-icon-1.png';
import adaptiveIcon2Image from '../../../assets/adaptive-icon-2.png';
import adaptiveIcon3Image from '../../../assets/adaptive-icon-3.png';
import adaptiveIcon4Image from '../../../assets/adaptive-icon-4.png';
import adaptiveIcon5Image from '../../../assets/adaptive-icon-5.png';
import adaptiveIcon6Image from '../../../assets/adaptive-icon-6.png';
import adaptiveIcon7Image from '../../../assets/adaptive-icon-7.png';
import adaptiveIcon8Image from '../../../assets/adaptive-icon-8.png';
import adaptiveIcon9Image from '../../../assets/adaptive-icon-9.png';
import adaptiveIcon10Image from '../../../assets/adaptive-icon-10.png';
import adaptiveIcon11Image from '../../../assets/adaptive-icon-11.png';
import adaptiveIconImage from '../../../assets/adaptive-icon.png';
import icon1Image from '../../../assets/icon-1.png';
import icon2Image from '../../../assets/icon-2.png';
import icon3Image from '../../../assets/icon-3.png';
import icon4Image from '../../../assets/icon-4.png';
import icon5Image from '../../../assets/icon-5.png';
import icon6Image from '../../../assets/icon-6.png';
import icon7Image from '../../../assets/icon-7.png';
import icon8Image from '../../../assets/icon-8.png';
import icon9Image from '../../../assets/icon-9.png';
import icon10Image from '../../../assets/icon-10.png';
import icon11Image from '../../../assets/icon-11.png';
import iconImage from '../../../assets/icon.png';

export const appIcons = [
  'default',
  'icon-1',
  'icon-2',
  'icon-3',
  'icon-4',
  'icon-5',
  'icon-6',
  'icon-7',
  'icon-8',
  'icon-9',
  'icon-10',
  'icon-11',
] as const;

export type AppIcon = (typeof appIcons)[number];

const iosAppIconAssets: Record<AppIcon, number> = {
  default: iconImage,
  'icon-1': icon1Image,
  'icon-2': icon2Image,
  'icon-3': icon3Image,
  'icon-4': icon4Image,
  'icon-5': icon5Image,
  'icon-6': icon6Image,
  'icon-7': icon7Image,
  'icon-8': icon8Image,
  'icon-9': icon9Image,
  'icon-10': icon10Image,
  'icon-11': icon11Image,
};

const androidAppIconAssets: Record<AppIcon, number> = {
  default: adaptiveIconImage,
  'icon-1': adaptiveIcon1Image,
  'icon-2': adaptiveIcon2Image,
  'icon-3': adaptiveIcon3Image,
  'icon-4': adaptiveIcon4Image,
  'icon-5': adaptiveIcon5Image,
  'icon-6': adaptiveIcon6Image,
  'icon-7': adaptiveIcon7Image,
  'icon-8': adaptiveIcon8Image,
  'icon-9': adaptiveIcon9Image,
  'icon-10': adaptiveIcon10Image,
  'icon-11': adaptiveIcon11Image,
};

export const appIconAssets = Platform.select({
  ios: iosAppIconAssets,
  android: androidAppIconAssets,
  default: iosAppIconAssets,
});

export const defaultAppIcon: AppIcon = 'default';
