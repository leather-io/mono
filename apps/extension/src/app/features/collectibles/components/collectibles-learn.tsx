import { useQuery } from '@tanstack/react-query';

import type { ResolvedLearnItem } from '@leather.io/cms';
import { LEATHER_GUIDES_URL } from '@leather.io/constants';
import { createLearnSectionQueryConfig } from '@leather.io/queries';

import { getLearnIcon } from './learn-icon-map';
import { type LearnItem, LearnLayout } from './learn-layout';

const defaultItems: ResolvedLearnItem[] = [
  {
    label: 'Getting Started with Leather',
    iconKey: 'rocket-startup-launch',
    url: `${LEATHER_GUIDES_URL}/create-new-wallet`,
  },
  {
    label: 'What are Bitcoin Ordinals?',
    iconKey: 'stamps-collection',
    url: `${LEATHER_GUIDES_URL}/what-are-bitcoin-ordinals`,
  },
  {
    label: 'Bitcoin NFTs: How Do They Work?',
    iconKey: 'stamps-collection',
    url: `${LEATHER_GUIDES_URL}/bitcoin-nfts`,
  },
];

function toLearnItems(items: ResolvedLearnItem[]): LearnItem[] {
  return items.map(item => ({
    title: item.label,
    url: item.url,
    icon: getLearnIcon(item.iconKey),
  }));
}

export function CollectiblesLearn() {
  const { data } = useQuery(createLearnSectionQueryConfig('extension-collectibles'));
  const items = toLearnItems(data ?? defaultItems);
  return <LearnLayout items={items} data-testid="collectibles-learn" />;
}
