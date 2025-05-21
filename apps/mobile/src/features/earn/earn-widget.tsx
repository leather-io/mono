import { HorizontalScrollView } from '@/components/horizontal-scroll-view';
import { FetchState, FetchWrapper } from '@/components/loading';
import { Widget } from '@/components/widget';
import { useStxTotalBalance } from '@/queries/balance/stx-balance.query';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { StxBalance } from '@leather.io/services';
import { Box, Text, Theme } from '@leather.io/ui/native';

import { LockedBalanceCard } from './locked-balance-card';
import { SbtcCard } from './sbtc-card';
import { StackingCard } from './stacking-card';

export function isStacking(stxBalance: FetchState<StxBalance>) {
  return stxBalance.state === 'success' && stxBalance.value.stx.lockedBalance.amount.gt(0);
}

export function EarnWidget() {
  const theme = useTheme<Theme>();

  const stxBalance = useStxTotalBalance();

  return (
    <Widget>
      <Box>
        <Widget.Header>
          <Text variant="label01">
            {t({
              id: 'earn.title',
              message: 'Earn',
            })}
          </Text>
        </Widget.Header>
      </Box>
      <Widget.Body>
        <FetchWrapper data={stxBalance}>
          {stxBalance.state == 'success' && isStacking(stxBalance) ? (
            <LockedBalanceCard
              fiatLockedBalance={stxBalance.value?.fiat.lockedBalance}
              stxLockedBalance={stxBalance.value?.stx.lockedBalance}
            />
          ) : (
            <HorizontalScrollView>
              <Box flexDirection="row" gap="3">
                <SbtcCard />
                <StackingCard />
              </Box>
            </HorizontalScrollView>
          )}
        </FetchWrapper>
      </Widget.Body>
    </Widget>
  );
}
