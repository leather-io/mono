import { Platform } from 'react-native';

import { msg } from '@lingui/core/macro';

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

export const appIconLabels: Record<AppIcon, ReturnType<typeof msg>> = {
  default: msg`Default`,
  'icon-1': msg`Icon 1`,
  'icon-2': msg`Icon 2`,
  'icon-3': msg`Icon 3`,
  'icon-4': msg`Icon 4`,
  'icon-5': msg`Icon 5`,
  'icon-6': msg`Icon 6`,
  'icon-7': msg`Icon 7`,
  'icon-8': msg`Icon 8`,
  'icon-9': msg`Icon 9`,
  'icon-10': msg`Icon 10`,
  'icon-11': msg`Icon 11`,
};

export const appIconAssets: Record<AppIcon, number> = Platform.select({
  ios: {
    default: require('../../../assets/icon.png'),
    'icon-1': require('../../../assets/icon-1.png'),
    'icon-2': require('../../../assets/icon-2.png'),
    'icon-3': require('../../../assets/icon-3.png'),
    'icon-4': require('../../../assets/icon-4.png'),
    'icon-5': require('../../../assets/icon-5.png'),
    'icon-6': require('../../../assets/icon-6.png'),
    'icon-7': require('../../../assets/icon-7.png'),
    'icon-8': require('../../../assets/icon-8.png'),
    'icon-9': require('../../../assets/icon-9.png'),
    'icon-10': require('../../../assets/icon-10.png'),
    'icon-11': require('../../../assets/icon-11.png'),
  },
  android: {
    default: require('../../../assets/adaptive-icon.png'),
    'icon-1': require('../../../assets/adaptive-icon-1.png'),
    'icon-2': require('../../../assets/adaptive-icon-2.png'),
    'icon-3': require('../../../assets/adaptive-icon-3.png'),
    'icon-4': require('../../../assets/adaptive-icon-4.png'),
    'icon-5': require('../../../assets/adaptive-icon-5.png'),
    'icon-6': require('../../../assets/adaptive-icon-6.png'),
    'icon-7': require('../../../assets/adaptive-icon-7.png'),
    'icon-8': require('../../../assets/adaptive-icon-8.png'),
    'icon-9': require('../../../assets/adaptive-icon-9.png'),
    'icon-10': require('../../../assets/adaptive-icon-10.png'),
    'icon-11': require('../../../assets/adaptive-icon-11.png'),
  },
}) as Record<AppIcon, number>;

export const defaultAppIcon: AppIcon = 'default';
