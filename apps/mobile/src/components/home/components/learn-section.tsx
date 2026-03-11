import type { ReactNode } from 'react';
import { Image } from 'react-native';

import { useOpenUrl } from '@/features/browser/browser/use-open-url';
import { t } from '@lingui/core/macro';
import { useQuery } from '@tanstack/react-query';

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

interface DefaultLearnItem {
  title: string;
  icon: ReactNode;
  url: string;
}

function getDefaultItems(): DefaultLearnItem[] {
  return [
    {
      title: t`Getting Started with Leather`,
      icon: getLearnIcon('rocket-startup-launch'),
      url: `${LEATHER_GUIDES_URL}/create-new-wallet`,
    },
    { title: t`What is sBTC?`, icon: getLearnIcon('sbtc'), url: LEATHER_SBTC_URL },
    {
      title: t`Learn more about stacking`,
      icon: getLearnIcon('coins-stack'),
      url: LEATHER_STACKING_URL,
    },
  ];
}

export function LearnSection() {
  const { openUrl } = useOpenUrl();
  const { data } = useQuery(createLearnSectionQueryConfig('mobile-home'));
  const items = data
    ? data.map(item => ({
        title: item.label,
        url: item.url,
        icon: item.iconUrl ? (
          <Image source={{ uri: item.iconUrl }} style={{ width: 24, height: 24 }} />
        ) : null,
      }))
    : getDefaultItems();

  return (
    <Box pb="5">
      <Text variant="label01" px="5" pb="3">
        {t`Learn`}
      </Text>
      {items.map(item => (
        <LearnListItem
          key={item.title}
          title={item.title}
          icon={item.icon}
          onPress={() => openUrl(item.url)}
        />
      ))}
    </Box>
  );
}
