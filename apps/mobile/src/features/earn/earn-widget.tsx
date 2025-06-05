import { ScrollView } from 'react-native-gesture-handler';

import { FetchState, FetchWrapper } from '@/components/loading';
import { Widget } from '@/components/widget';
import { useStxTotalBalance } from '@/queries/balance/stx-balance.query';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { StxBalance } from '@leather.io/services';
import { Box, Text, Theme } from '@leather.io/ui/native';

import { useEarnFlag } from '../feature-flags';
import { LockedBalanceCard } from './locked-balance-card';
import { SbtcCard } from './sbtc-card';
import { StackingCard } from './stacking-card';

export function isStacking(stxBalance: FetchState<StxBalance>) {
  return stxBalance.state === 'success' && stxBalance.value.stx.lockedBalance.amount.gt(0);
}

export function EarnWidget() {
  const theme = useTheme<Theme>();

  const stxBalance = useStxTotalBalance();
  const earnFlag = useEarnFlag();
  const userIsStacking = stxBalance.state == 'success' && isStacking(stxBalance);

  if (!earnFlag && !userIsStacking) return null;

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
          {userIsStacking ? (
            <LockedBalanceCard
              quoteLockedBalance={stxBalance.value?.quote.lockedBalance}
              stxLockedBalance={stxBalance.value?.stx.lockedBalance}
            />
          ) : (
            earnFlag && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{
                  gap: theme.spacing['2'],
                  paddingHorizontal: theme.spacing['5'],
                }}
                style={{
                  // prevent card shadows being cut off
                  overflow: 'visible',
                }}
              >
                <Box flexDirection="row" gap="3">
                  <SbtcCard />
                  <StackingCard />
                </Box>
              </ScrollView>
            )
          )}
        </FetchWrapper>
      </Widget.Body>
    </Widget>
  );
}
