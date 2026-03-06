import { useQuery } from '@tanstack/react-query';

import { LEATHER_EARN_SBTC_URL, LEATHER_EARN_STACKING_URL } from '@leather.io/constants';
import { createHelpCenterCategoriesQueryConfig } from '@leather.io/queries';
import {
  buildGuideUrl,
  findGuideSlugInCategories,
  getHelpCenterBaseUrl,
} from '@leather.io/services';
import { CoinsStackIcon, RocketStartupLaunchIcon, SbtcIcon } from '@leather.io/ui';

import { type LearnItem, LearnLayout } from '@app/features/collectibles/components/learn-layout';

function useTokensLearnItems(): LearnItem[] {
  const { data: categories } = useQuery(createHelpCenterCategoriesQueryConfig());

  const gettingStartedUrl = categories
    ? (findGuideSlugInCategories(categories, 'create-new-wallet') ??
      findGuideSlugInCategories(categories, 'get-started'))
    : undefined;

  return [
    {
      title: 'Getting Started with Leather',
      url: gettingStartedUrl ? buildGuideUrl(gettingStartedUrl) : getHelpCenterBaseUrl(),
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
}

export function TokensLearn() {
  const learnItems = useTokensLearnItems();
  return <LearnLayout items={learnItems} data-testid="tokens-learn" />;
}
