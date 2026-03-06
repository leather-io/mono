import { useQuery } from '@tanstack/react-query';

import { LEATHER_GUIDES_BNS_URL } from '@leather.io/constants';
import { createHelpCenterCategoriesQueryConfig } from '@leather.io/queries';
import {
  buildGuideUrl,
  findGuideSlugInCategories,
  getHelpCenterBaseUrl,
} from '@leather.io/services';
import { BnsIcon, RocketStartupLaunchIcon, StampsCollectionIcon } from '@leather.io/ui';

import { type LearnItem, LearnLayout } from './learn-layout';

function useCollectiblesLearnItems(): LearnItem[] {
  const { data: categories } = useQuery(createHelpCenterCategoriesQueryConfig());

  const gettingStartedUrl = categories
    ? (findGuideSlugInCategories(categories, 'create-new-wallet') ??
      findGuideSlugInCategories(categories, 'get-started'))
    : undefined;

  const ordinalsUrl = categories
    ? findGuideSlugInCategories(categories, 'what-are-bitcoin-ordinals')
    : undefined;

  return [
    {
      title: 'Getting Started with Leather',
      url: gettingStartedUrl ? buildGuideUrl(gettingStartedUrl) : getHelpCenterBaseUrl(),
      icon: <RocketStartupLaunchIcon />,
    },
    {
      title: 'What are Bitcoin Ordinals?',
      url: ordinalsUrl ? buildGuideUrl(ordinalsUrl) : getHelpCenterBaseUrl(),
      icon: <StampsCollectionIcon />,
    },
    {
      title: 'What is BNS? (Bitcoin Naming System)',
      url: LEATHER_GUIDES_BNS_URL,
      icon: <BnsIcon />,
    },
  ];
}

export function CollectiblesLearn() {
  const learnItems = useCollectiblesLearnItems();
  return <LearnLayout items={learnItems} data-testid="collectibles-learn" />;
}
