import type { ReactNode } from 'react';

import { useOpenUrl } from '@/features/browser/browser/use-open-url';
import { t } from '@lingui/core/macro';
import { useQuery } from '@tanstack/react-query';

import type { ResolvedLearnItem } from '@leather.io/cms';
import { LEATHER_GUIDES_URL, LEATHER_SBTC_URL, LEATHER_STACKING_URL } from '@leather.io/constants';
import { createLearnSectionQueryConfig } from '@leather.io/queries';
import { Box, Cell, Text } from '@leather.io/ui/native';

import { getLearnIcon } from './learn-icon-map.native';

interface LearnListItemProps {
  title: string;
  icon: ReactNode;
  onPress(): void;
}

function LearnListItem({ title, icon, onPress }: LearnListItemProps) {
  return (
    <Cell.Root pressable onPress={onPress}>
      {icon && (
        <Cell.Icon>
          <Box
            p="3"
            bg="ink.background-secondary"
            borderRadius="xs"
            borderWidth={1}
            borderColor="ink.component-background-hover"
          >
            {icon}
          </Box>
        </Cell.Icon>
      )}
      <Cell.Content>
        <Cell.Label variant="primary">{title}</Cell.Label>
      </Cell.Content>
    </Cell.Root>
  );
}

function getDefaultItems(): ResolvedLearnItem[] {
  return [
    {
      label: t`Getting Started with Leather`,
      iconKey: 'rocket-startup-launch',
      url: `${LEATHER_GUIDES_URL}/create-new-wallet`,
    },
    { label: t`What is sBTC?`, iconKey: 'sbtc', url: LEATHER_SBTC_URL },
    { label: t`Learn more about stacking`, iconKey: 'coins-stack', url: LEATHER_STACKING_URL },
  ];
}

export function LearnSection() {
  const { openUrl } = useOpenUrl();
  const { data } = useQuery(createLearnSectionQueryConfig('mobile-home'));
  const items = data ?? getDefaultItems();

  return (
    <Box pb="5">
      <Text variant="label01" px="5" pb="3">
        {t`Learn`}
      </Text>
      {items.map(item => (
        <LearnListItem
          key={item.label}
          title={item.label}
          icon={getLearnIcon(item.iconKey)}
          onPress={() => openUrl(item.url)}
        />
      ))}
    </Box>
  );
}
