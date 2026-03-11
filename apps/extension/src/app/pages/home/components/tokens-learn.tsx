import { useQuery } from '@tanstack/react-query';

import { LEATHER_GUIDES_URL, LEATHER_SBTC_URL, LEATHER_STACKING_URL } from '@leather.io/constants';
import { createLearnSectionQueryConfig } from '@leather.io/queries';

import { getLearnIcon } from '@app/features/collectibles/components/learn-icon-map';
import { type LearnItem, LearnLayout } from '@app/features/collectibles/components/learn-layout';

const defaultItems: LearnItem[] = [
  {
    title: 'Getting Started with Leather',
    icon: getLearnIcon('rocket-startup-launch'),
    url: `${LEATHER_GUIDES_URL}/create-new-wallet`,
  },
  { title: 'What is sBTC?', icon: getLearnIcon('sbtc'), url: LEATHER_SBTC_URL },
  {
    title: 'Learn more about stacking',
    icon: getLearnIcon('coins-stack'),
    url: LEATHER_STACKING_URL,
  },
];

export function TokensLearn() {
  const { data } = useQuery(createLearnSectionQueryConfig('extension-tokens'));
  const items: LearnItem[] = data
    ? data.map(item => ({
        title: item.label,
        url: item.url,
        icon: item.iconUrl ? <img src={item.iconUrl} alt="" width={24} height={24} /> : null,
      }))
    : defaultItems;
  return <LearnLayout items={items} data-testid="tokens-learn" />;
}
