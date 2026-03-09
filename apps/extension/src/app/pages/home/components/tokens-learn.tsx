import { useQuery } from '@tanstack/react-query';

import { createLearnSectionQueryConfig } from '@leather.io/queries';
import { type ResolvedLearnItem, getHelpCenterBaseUrl } from '@leather.io/services';

import { getLearnIcon } from '@app/features/collectibles/components/learn-icon-map';
import { type LearnItem, LearnLayout } from '@app/features/collectibles/components/learn-layout';

const defaultItems: ResolvedLearnItem[] = [
  {
    label: 'Getting Started with Leather',
    iconKey: 'rocket-startup-launch',
    url: getHelpCenterBaseUrl(),
  },
  { label: 'What is sBTC?', iconKey: 'sbtc', url: 'https://app.leather.io/sbtc' },
  {
    label: 'Learn more about stacking',
    iconKey: 'coins-stack',
    url: 'https://app.leather.io/stacking',
  },
];

function toLearnItems(items: ResolvedLearnItem[]): LearnItem[] {
  return items.map(item => ({
    title: item.label,
    url: item.url,
    icon: getLearnIcon(item.iconKey),
  }));
}

export function TokensLearn() {
  const { data } = useQuery(createLearnSectionQueryConfig('extension-tokens'));
  const items = toLearnItems(data ?? defaultItems);
  return <LearnLayout items={items} data-testid="tokens-learn" />;
}
