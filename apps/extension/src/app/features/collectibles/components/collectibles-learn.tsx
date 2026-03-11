import { useQuery } from '@tanstack/react-query';

import { LEATHER_GUIDES_URL } from '@leather.io/constants';
import { createLearnSectionQueryConfig } from '@leather.io/queries';

import { getLearnIcon } from './learn-icon-map';
import { type LearnItem, LearnLayout } from './learn-layout';

const defaultItems: LearnItem[] = [
  {
    title: 'Getting Started with Leather',
    icon: getLearnIcon('rocket-startup-launch'),
    url: `${LEATHER_GUIDES_URL}/create-new-wallet`,
  },
  {
    title: 'What are Bitcoin Ordinals?',
    icon: getLearnIcon('stamps-collection'),
    url: `${LEATHER_GUIDES_URL}/what-are-bitcoin-ordinals`,
  },
  {
    title: 'Bitcoin NFTs: How Do They Work?',
    icon: getLearnIcon('stamps-collection'),
    url: `${LEATHER_GUIDES_URL}/bitcoin-nfts`,
  },
];

export function CollectiblesLearn() {
  const { data } = useQuery(createLearnSectionQueryConfig('extension-collectibles'));
  const items: LearnItem[] = data
    ? data.map(item => ({
        title: item.label,
        url: item.url,
        icon: item.iconUrl ? <img src={item.iconUrl} alt="" width={24} height={24} /> : null,
      }))
    : defaultItems;
  return <LearnLayout items={items} data-testid="collectibles-learn" />;
}
