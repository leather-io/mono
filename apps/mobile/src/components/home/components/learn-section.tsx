import type { ReactNode } from 'react';

import { useOpenUrl } from '@/features/browser/browser/use-open-url';
import { t } from '@lingui/core/macro';

import {
  LEATHER_GETTING_STARTED,
  LEATHER_SBTC_TUTORIAL,
  LEATHER_STACKING_TUTORIAL,
} from '@leather.io/constants';
import {
  Box,
  Cell,
  CoinsStackIcon,
  RocketStartupLaunchIcon,
  SbtcIcon,
  Text,
} from '@leather.io/ui/native';

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

export function LearnSection() {
  const { openUrl } = useOpenUrl();

  return (
    <Box pb="5">
      <Text variant="label01" px="5" pb="3">
        {t`Learn`}
      </Text>
      <LearnListItem
        title={t`Getting Started with Leather`}
        icon={<RocketStartupLaunchIcon />}
        onPress={() => openUrl(LEATHER_GETTING_STARTED)}
      />
      <LearnListItem
        title={t`What is sBTC?`}
        icon={<SbtcIcon />}
        onPress={() => openUrl(LEATHER_SBTC_TUTORIAL)}
      />
      <LearnListItem
        title={t`Learn more about stacking`}
        icon={<CoinsStackIcon />}
        onPress={() => openUrl(LEATHER_STACKING_TUTORIAL)}
      />
    </Box>
  );
}
