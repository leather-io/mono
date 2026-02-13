import type { ReactNode } from 'react';

import { Box, Stack, styled } from 'leather-styles/jsx';

import {
  type ActivityView,
  formatPriceChangeText,
  getPriceChangeColor,
} from '@leather.io/features';
import type { Money } from '@leather.io/models';

import { formatCurrency } from '@app/common/currency-formatter';

import { ActivityItem } from '../activity-list/components/activity-item';
import { TokenDetailsRow } from './components/token-details-row';
import { TokenDetailsScreen } from './components/token-details-screen';
import { TokenDetailsSection } from './components/token-details-section';
import { TokenOverview } from './components/token-overview';

interface RuneTokenDetailsLayoutProps {
  icon: ReactNode;
  name: string;
  symbol?: string;
  availableBalance: Money;
  fiatBalance: Money;
  changePercent: number;
  descriptionText: string;
  activity: ActivityView[];
}

export function RuneTokenDetailsLayout({
  icon,
  name,
  symbol,
  availableBalance,
  fiatBalance,
  changePercent,
  descriptionText,
  activity,
}: RuneTokenDetailsLayoutProps) {
  return (
    <TokenDetailsScreen
      title={name}
      overview={
        <TokenOverview
          icon={icon}
          availableBalance={availableBalance}
          symbol={symbol}
          fiatBalance={fiatBalance}
        />
      }
    >
      {descriptionText ? (
        <TokenDetailsSection title="Description">
          <Box px="space.05" pb="space.03">
            <styled.p textStyle="body.02" margin="0">
              {descriptionText}
            </styled.p>
          </Box>
        </TokenDetailsSection>
      ) : null}

      <TokenDetailsSection title="Token details">
        <TokenDetailsRow label="Name" value={symbol ? `${name} (${symbol})` : name} />
        <TokenDetailsRow
          label="Price change (24hr)"
          value={
            <styled.span textStyle="caption.01" color={getPriceChangeColor(changePercent)}>
              {formatPriceChangeText({ changePercent })}
            </styled.span>
          }
        />
        <TokenDetailsRow label="Layer" value="Layer 1 (Bitcoin)" />
        <TokenDetailsRow label="Protocol" value="Runes" />
      </TokenDetailsSection>

      {activity.length > 0 ? (
        <TokenDetailsSection title="Activity">
          <Stack>
            {activity.map(item => (
              <Box key={item.key} px="space.05" py="space.03" bg="ink.background-primary">
                <ActivityItem item={item} formatCurrency={formatCurrency} />
              </Box>
            ))}
          </Stack>
        </TokenDetailsSection>
      ) : null}
    </TokenDetailsScreen>
  );
}
