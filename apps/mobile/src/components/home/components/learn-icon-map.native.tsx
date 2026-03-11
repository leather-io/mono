import type { ReactNode } from 'react';

import {
  CoinsStackIcon,
  RocketStartupLaunchIcon,
  SbtcIcon,
  StampsCollectionIcon,
} from '@leather.io/ui/native';

const iconMap: Record<string, ReactNode> = {
  'rocket-startup-launch': <RocketStartupLaunchIcon />,
  'stamps-collection': <StampsCollectionIcon />,
  sbtc: <SbtcIcon />,
  'coins-stack': <CoinsStackIcon />,
};

export function getLearnIcon(iconKey: string): ReactNode {
  return iconMap[iconKey] ?? <RocketStartupLaunchIcon />;
}
