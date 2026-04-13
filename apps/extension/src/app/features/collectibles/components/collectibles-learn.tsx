import { useQuery } from '@tanstack/react-query';

import type { ResolvedLearnItem } from '@leather.io/cms';
import { LEATHER_GUIDES_URL } from '@leather.io/constants';
import { createLearnSectionQueryConfig } from '@leather.io/queries';

import { useFlags } from '@app/features/feature-flags';

import { getLearnIcon } from './learn-icon-map';
import { type LearnItem, LearnLayout } from './learn-layout';

function toLearnItems(items: ResolvedLearnItem[]): LearnItem[] {
  return items.map(item => ({
    title: item.label,
    url: item.url,
    icon: getLearnIcon(item.iconKey),
  }));
}

const gettingStarted = {
  label: 'Getting Started with Leather',
  iconKey: 'rocket-startup-launch',
  url: `${LEATHER_GUIDES_URL}/create-new-wallet`,
};
const whatAreOrdinals = {
  label: 'What are Bitcoin Ordinals?',
  iconKey: 'stamps-collection',
  url: `${LEATHER_GUIDES_URL}/what-are-bitcoin-ordinals`,
};
const whatAreBtcNfts = {
  label: 'Bitcoin NFTs: How Do They Work?',
  iconKey: 'stamps-collection',
  url: `${LEATHER_GUIDES_URL}/bitcoin-nfts`,
};

export function CollectiblesLearn() {
  const { data } = useQuery(createLearnSectionQueryConfig('extension-collectibles'));
  const { isOrdinalsActive } = useFlags();
  function getDefaultItems() {
    const defaultItems: ResolvedLearnItem[] = [gettingStarted];
    if (isOrdinalsActive) {
      defaultItems.push(whatAreOrdinals, whatAreBtcNfts);
    }
    return defaultItems;
  }

  const items = toLearnItems(data ?? getDefaultItems());
  return <LearnLayout items={items} data-testid="collectibles-learn" />;
}
