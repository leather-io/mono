import { useQuery } from '@tanstack/react-query';

import { createLearnSectionQueryConfig } from '@leather.io/queries';
import { type ResolvedLearnItem, getHelpCenterBaseUrl } from '@leather.io/services';

import { getLearnIcon } from './learn-icon-map';
import { type LearnItem, LearnLayout } from './learn-layout';

const defaultItems: ResolvedLearnItem[] = [
  {
    label: 'Getting Started with Leather',
    iconKey: 'rocket-startup-launch',
    url: getHelpCenterBaseUrl(),
  },
  {
    label: 'What are Bitcoin Ordinals?',
    iconKey: 'stamps-collection',
    url: getHelpCenterBaseUrl(),
  },
  { label: 'What is BNS? (Bitcoin Naming System)', iconKey: 'bns', url: getHelpCenterBaseUrl() },
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
