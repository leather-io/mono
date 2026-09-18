import type { ReactNode } from 'react';

import { Box, Stack, styled } from 'leather-styles/jsx';

import type { BlockchainActivityItem } from '@leather.io/features';
import { Tabs } from '@leather.io/ui';

import { ActivityRow } from '@app/features/activity-list/components/activity-row';
import { type TokenDetailsTab, defaultTokenDetailsTab } from '@app/store/settings/settings.slice';

import { TokenDetailsSection } from './token-details-section';

interface TokenDetailsTabItem {
  label: string;
  value: TokenDetailsTab;
}

const tokenDetailsTabItems: TokenDetailsTabItem[] = [
  { label: 'Info', value: 'info' },
  { label: 'Balances', value: 'balances' },
  { label: 'Activity', value: 'activity' },
];

function isTokenDetailsTab(value: string): value is TokenDetailsTab {
  return tokenDetailsTabItems.some(item => item.value === value);
}

interface TokenDetailsTabsProps {
  activeTab: TokenDetailsTab;
  onSelectTab(tab: TokenDetailsTab): void;
  priceContent?: ReactNode;
  descriptionText?: string;
  detailRows: ReactNode;
  balancesContent?: ReactNode;
  activity: BlockchainActivityItem[];
}

export function TokenDetailsTabs({
  activeTab,
  onSelectTab,
  priceContent,
  descriptionText,
  detailRows,
  balancesContent,
  activity,
}: TokenDetailsTabsProps) {
  const tabItems = tokenDetailsTabItems.filter(
    item => item.value !== 'balances' || !!balancesContent
  );
  const isActiveTabAvailable = tabItems.some(item => item.value === activeTab);
  const visibleTab: TokenDetailsTab = isActiveTabAvailable ? activeTab : defaultTokenDetailsTab;

  function handleTabChange(value: string) {
    if (isTokenDetailsTab(value)) onSelectTab(value);
  }

  return (
    <Tabs.Root value={visibleTab} onValueChange={handleTabChange}>
      <Tabs.List>
        {tabItems.map(item => (
          <Tabs.Trigger
            key={item.value}
            value={item.value}
            data-testid={`token-details-tab-${item.value}`}
          >
            {item.label}
          </Tabs.Trigger>
        ))}
      </Tabs.List>
      <Tabs.Content value="info">
        <Stack gap="space.00">
          {priceContent}
          {descriptionText ? (
            <TokenDetailsSection title="About">
              <Box px="space.05" pb="space.02">
                <styled.p textStyle="body.02" margin="0" data-testid="token-details-description">
                  {descriptionText}
                </styled.p>
              </Box>
            </TokenDetailsSection>
          ) : null}
          <TokenDetailsSection title="Token details">{detailRows}</TokenDetailsSection>
        </Stack>
      </Tabs.Content>
      {balancesContent ? (
        <Tabs.Content value="balances">
          <Box py="space.02" data-testid="token-details-balances">
            {balancesContent}
          </Box>
        </Tabs.Content>
      ) : null}
      <Tabs.Content value="activity">
        <Box py="space.02" data-testid="token-details-activity">
          {activity.length > 0 ? (
            activity.map(item => <ActivityRow key={item.view.key} item={item} />)
          ) : (
            <styled.p px="space.05" py="space.04" textStyle="body.02" color="ink.text-subdued">
              No activity for this token yet
            </styled.p>
          )}
        </Box>
      </Tabs.Content>
    </Tabs.Root>
  );
}
