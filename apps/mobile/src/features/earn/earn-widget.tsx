import { ScrollView } from 'react-native-gesture-handler';

import { Balance } from '@/components/balance/balance';
import { FetchState, FetchWrapper } from '@/components/loading';
import { Widget } from '@/components/widget';
import { useStxTotalBalance } from '@/queries/balance/stx-balance.query';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { StxBalance } from '@leather.io/services';
import { Box, Flag, ItemLayout, Text, Theme } from '@leather.io/ui/native';

import { EarnCard } from './earn-card';

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
          {stxBalance.state === 'success' && isStacking(stxBalance) ? (
            <EarnCard
              fiatLockedBalance={stxBalance.value?.fiat.lockedBalance}
              stxLockedBalance={stxBalance.value?.stx.lockedBalance}
            />
          ) : (
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
              <Box>
                <Text variant="label03">
                  {t({
                    id: 'earn.no_staking',
                    message: 'No staking',
                  })}
                </Text>
              </Box>
            </ScrollView>
          )}
        </FetchWrapper>
      </Widget.Body>
    </Widget>
  );
}
