import {
  LEATHER_EARN_SBTC_URL,
  LEATHER_EARN_STACKING_URL,
  LEATHER_GUIDES_GETTING_STARTED_URL,
} from '@leather.io/constants';
import { CoinsStackIcon, RocketStartupLaunchIcon, SbtcIcon } from '@leather.io/ui';

import { type LearnItem, LearnLayout } from '@app/features/collectibles/components/learn-layout';

const learnItems: LearnItem[] = [
  {
    title: 'Getting Started with Leather',
    url: LEATHER_GUIDES_GETTING_STARTED_URL,
    icon: <RocketStartupLaunchIcon />,
  },
  {
    title: 'What is sBTC?',
    url: LEATHER_EARN_SBTC_URL,
    icon: <SbtcIcon />,
  },
  {
    title: 'Learn more about stacking',
    url: LEATHER_EARN_STACKING_URL,
    icon: <CoinsStackIcon />,
  },
];

export function TokensLearn() {
  return <LearnLayout items={learnItems} data-testid="tokens-learn" />;
}
