import { Stack, styled } from 'leather-styles/jsx';

import { LEATHER_GUIDES_URL } from '@leather.io/constants';
import { PassportIcon, RocketIcon, StampIcon } from '@leather.io/ui';

import { LearnItem } from './learn-item';

const learnItems = [
  {
    id: 'getting-started',
    icon: <RocketIcon />,
    title: 'Getting Started with Leather',
    url: `${LEATHER_GUIDES_URL}/getting-started`,
  },
  {
    id: 'ordinals',
    icon: <StampIcon />,
    title: 'What are Bitcoin Ordinals?',
    url: `${LEATHER_GUIDES_URL}/ordinals`,
  },
  {
    id: 'bns',
    icon: <PassportIcon />,
    title: 'What is BNS? (Bitcoin Naming System)',
    url: `${LEATHER_GUIDES_URL}/bns`,
  },
];

export function LearnWidget() {
  return (
    <Stack gap="space.03" pt="space.03">
      <styled.span textStyle="label.01">Learn</styled.span>
      <Stack gap="space.00">
        {learnItems.map(item => (
          <LearnItem key={item.id} icon={item.icon} title={item.title} url={item.url} />
        ))}
      </Stack>
    </Stack>
  );
}
