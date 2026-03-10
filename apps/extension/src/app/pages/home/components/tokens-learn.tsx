import { useQuery } from '@tanstack/react-query';

import type { ResolvedLearnItem } from '@leather.io/cms';
import { LEATHER_GUIDES_URL, LEATHER_SBTC_URL, LEATHER_STACKING_URL } from '@leather.io/constants';
import { createLearnSectionQueryConfig } from '@leather.io/queries';

import { getLearnIcon } from '@app/features/collectibles/components/learn-icon-map';
import { type LearnItem, LearnLayout } from '@app/features/collectibles/components/learn-layout';

const defaultItems: ResolvedLearnItem[] = [
  {
    label: 'Getting Started with Leather',
    iconKey: 'rocket-startup-launch',
    url: `${LEATHER_GUIDES_URL}/create-new-wallet`,
  },
  { label: 'What is sBTC?', iconKey: 'sbtc', url: LEATHER_SBTC_URL },
  { label: 'Learn more about stacking', iconKey: 'coins-stack', url: LEATHER_STACKING_URL },
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
