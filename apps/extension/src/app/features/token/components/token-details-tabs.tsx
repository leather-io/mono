import type { ReactNode } from 'react';

import { Box, Stack, styled } from 'leather-styles/jsx';

import type { BlockchainActivityItem } from '@leather.io/features';
import { Tabs } from '@leather.io/ui';

import { ActivityRow } from '@app/features/activity-list/components/activity-row';
import { type TokenDetailsTab, defaultTokenDetailsTab } from '@app/store/settings/settings.slice';

import { TokenActivityEmpty } from './token-activity-empty';
import { TokenActivityLoading } from './token-activity-loading';
import { TokenDetailsSection } from './token-details-section';

interface TokenDetailsTabItem {
  label: string;
  value: TokenDetailsTab;
}

const tokenDetailsTabItems: TokenDetailsTabItem[] = [
  { label: 'Activity', value: 'activity' },
  { label: 'Balances', value: 'balances' },
  { label: 'Info', value: 'info' },
];

function isTokenDetailsTab(value: string): value is TokenDetailsTab {
  return tokenDetailsTabItems.some(item => item.value === value);
}

export function resolveVisibleTokenDetailsTab(
  activeTab: TokenDetailsTab,
  hasBalances: boolean
): TokenDetailsTab {
  if (activeTab === 'balances' && !hasBalances) return defaultTokenDetailsTab;
  return activeTab;
}

interface TokenDetailsTabsProps {
  activeTab: TokenDetailsTab;
  onSelectTab(tab: TokenDetailsTab): void;
  priceContent?: ReactNode;
  descriptionText?: string;
  detailRows: ReactNode;
  balancesContent?: ReactNode;
  activity: BlockchainActivityItem[];
  isActivityLoading: boolean;
  hasBalance: boolean;
}

export function TokenDetailsTabs({
  activeTab,
  onSelectTab,
  priceContent,
  descriptionText,
  detailRows,
  balancesContent,
  activity,
  isActivityLoading,
  hasBalance,
}: TokenDetailsTabsProps) {
  const tabItems = tokenDetailsTabItems.filter(
    item => item.value !== 'balances' || !!balancesContent
  );

  function handleTabChange(value: string) {
    if (isTokenDetailsTab(value)) onSelectTab(value);
  }

  function renderActivity() {
    if (isActivityLoading) return <TokenActivityLoading />;
    if (activity.length === 0) return <TokenActivityEmpty hasBalance={hasBalance} />;
    return activity.map(item => <ActivityRow key={item.view.key} item={item} />);
  }

  return (
    <Tabs.Root value={activeTab} onValueChange={handleTabChange}>
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
          {renderActivity()}
        </Box>
      </Tabs.Content>
    </Tabs.Root>
  );
}
