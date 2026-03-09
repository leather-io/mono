import type { ReactNode } from 'react';

import {
  BnsIcon,
  CoinsStackIcon,
  RocketStartupLaunchIcon,
  SbtcIcon,
  StampsCollectionIcon,
} from '@leather.io/ui';

const iconMap: Record<string, ReactNode> = {
  'rocket-startup-launch': <RocketStartupLaunchIcon />,
  'stamps-collection': <StampsCollectionIcon />,
  bns: <BnsIcon />,
  sbtc: <SbtcIcon />,
  'coins-stack': <CoinsStackIcon />,
};

export function getLearnIcon(iconKey: string): ReactNode {
  return iconMap[iconKey] ?? <RocketStartupLaunchIcon />;
}
