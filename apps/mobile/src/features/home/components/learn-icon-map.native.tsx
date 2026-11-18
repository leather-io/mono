import type { ReactNode } from 'react';

import { BnsIcon, CoinsStackIcon, RocketStartupLaunchIcon, SbtcIcon } from '@leather.io/ui/native';

const iconMap: Record<string, ReactNode> = {
  'rocket-startup-launch': <RocketStartupLaunchIcon />,
  bns: <BnsIcon />,
  sbtc: <SbtcIcon />,
  'coins-stack': <CoinsStackIcon />,
};

export function getLearnIcon(iconKey: string): ReactNode {
  return iconMap[iconKey] ?? <RocketStartupLaunchIcon />;
}
