import { useQuery } from '@tanstack/react-query';

import type { ResolvedLearnItem } from '@leather.io/cms';
import { LEATHER_GUIDES_URL } from '@leather.io/constants';
import { createLearnSectionQueryConfig } from '@leather.io/queries';

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

export function CollectiblesLearn() {
  const { data } = useQuery(createLearnSectionQueryConfig('extension-collectibles'));
  const defaultItems: ResolvedLearnItem[] = [gettingStarted];
  const items = toLearnItems(data ?? defaultItems);
  return <LearnLayout items={items} data-testid="collectibles-learn" />;
}
