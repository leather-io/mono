import { t } from '@lingui/core/macro';
import { Trans } from '@lingui/react/macro';

import { BitcoinIcon, GlobeIcon, GraduateCapIcon, Stack, Text } from '@leather.io/ui/native';

import { LearnItem } from './learn-item';

function useLearnItems() {
  return [
    {
      id: 'getting-started',
      icon: <GraduateCapIcon color="ink.text-subdued" />,
      title: t`Getting Started with Leather`,
      url: 'https://leather.io/guides/getting-started',
    },
    {
      id: 'ordinals',
      icon: <BitcoinIcon color="ink.text-subdued" />,
      title: t`What are Bitcoin Ordinals?`,
      url: 'https://leather.io/guides/ordinals',
    },
    {
      id: 'bns',
      icon: <GlobeIcon color="ink.text-subdued" />,
      title: t`What is BNS? (Bitcoin Naming System)`,
      url: 'https://leather.io/guides/bns',
    },
  ];
}

export function LearnWidget() {
  const learnItems = useLearnItems();

  return (
    <Stack gap="3" px="5" pt="4">
      <Text variant="label01">
        <Trans>Learn</Trans>
      </Text>
      <Stack>
        {learnItems.map(item => (
          <LearnItem key={item.id} icon={item.icon} title={item.title} url={item.url} />
        ))}
      </Stack>
    </Stack>
  );
}
