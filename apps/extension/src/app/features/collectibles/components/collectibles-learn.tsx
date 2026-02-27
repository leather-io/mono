import {
  LEATHER_GUIDES_BNS_URL,
  LEATHER_GUIDES_GETTING_STARTED_URL,
  LEATHER_GUIDES_ORDINALS_URL,
} from '@leather.io/constants';
import { BnsIcon, RocketStartupLaunchIcon, StampsCollectionIcon } from '@leather.io/ui';

import { type LearnItem, LearnLayout } from './learn-layout';

const learnItems: LearnItem[] = [
  {
    title: 'Getting Started with Leather',
    url: LEATHER_GUIDES_GETTING_STARTED_URL,
    icon: <RocketStartupLaunchIcon />,
  },
  {
    title: 'What are Bitcoin Ordinals?',
    url: LEATHER_GUIDES_ORDINALS_URL,
    icon: <StampsCollectionIcon />,
  },
  {
    title: 'What is BNS? (Bitcoin Naming System)',
    url: LEATHER_GUIDES_BNS_URL,
    icon: <BnsIcon />,
  },
];

export function CollectiblesLearn() {
  return <LearnLayout items={learnItems} data-testid="collectibles-learn" />;
}
