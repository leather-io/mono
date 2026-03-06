import type { ReactNode } from 'react';

import { useOpenUrl } from '@/features/browser/browser/use-open-url';
import { t } from '@lingui/core/macro';
import { useQuery } from '@tanstack/react-query';

import { createHelpCenterCategoriesQueryConfig } from '@leather.io/queries';
import {
  buildGuideUrl,
  findGuideSlugInCategories,
  getHelpCenterBaseUrl,
} from '@leather.io/services';
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

function useGuideUrl(slug: string): string {
  const { data: categories } = useQuery(createHelpCenterCategoriesQueryConfig());
  const found = categories ? findGuideSlugInCategories(categories, slug) : undefined;
  return found ? buildGuideUrl(found) : getHelpCenterBaseUrl();
}

export function LearnSection() {
  const { openUrl } = useOpenUrl();
  const gettingStartedUrl = useGuideUrl('create-new-wallet');
  const sbtcUrl = useGuideUrl('bridge-sbtc');
  const stackingUrl = useGuideUrl('getting-started-with-stacking');

  return (
    <Box pb="5">
      <Text variant="label01" px="5" pb="3">
        {t`Learn`}
      </Text>
      <LearnListItem
        title={t`Getting Started with Leather`}
        icon={<RocketStartupLaunchIcon />}
        onPress={() => openUrl(gettingStartedUrl)}
      />
      <LearnListItem
        title={t`What is sBTC?`}
        icon={<SbtcIcon />}
        onPress={() => openUrl(sbtcUrl)}
      />
      <LearnListItem
        title={t`Learn more about stacking`}
        icon={<CoinsStackIcon />}
        onPress={() => openUrl(stackingUrl)}
      />
    </Box>
  );
}
