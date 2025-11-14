import { useGlobalSheets } from '@/core/global-sheet-provider';
import { useMarketDataQuery } from '@/queries/market-data/market-data.query';
import { formatCurrency } from '@/utils/currency-formatter';
import { t } from '@lingui/core/macro';

import { btcAsset } from '@leather.io/constants';
import {
  Box,
  Pressable,
  QuestionCircleIcon,
  Text,
  legacyTouchablePressEffect,
} from '@leather.io/ui/native';
import { baseCurrencyAmountInQuote, createMoney } from '@leather.io/utils';

import { TokenDetailsCard } from '../components/token-details-card';
import { TokenStatCard, TokenStatCardItem } from '../components/token-stat-card';

interface InscriptionTokenStatsProps {
  outputValue?: string;
}
export function InscriptionTokenStats({ outputValue }: InscriptionTokenStatsProps) {
  const marketData = useMarketDataQuery(btcAsset);
  const { descriptionSheetRef } = useGlobalSheets();
  const outputValueInQuote = marketData.data
    ? formatCurrency(
        baseCurrencyAmountInQuote(createMoney(Number(outputValue), 'BTC'), marketData.data)
      )
    : undefined;
  return (
    <TokenDetailsCard>
      <TokenStatCard>
        <TokenStatCardItem
          label={
            <Pressable
              pressEffects={legacyTouchablePressEffect}
              onPress={() => {
                descriptionSheetRef.current?.present({
                  title: t`Output value`,
                  data: [
                    {
                      key: 'paragraph',
                      text: t`
The amount of bitcoin assigned to the inscription on-chain. A higher output value indicates a UTXO with more satoshis locked to that collectible.`,
                    },
                  ],
                });
              }}
              flexDirection="row"
              gap="1"
              alignItems="center"
            >
              <Text variant="label02">{t`Output value`}</Text>
              <QuestionCircleIcon variant="small" />
            </Pressable>
          }
          value={
            <Box flexDirection="column" gap="1">
              <Text variant="label01">{`${outputValue} sats`}</Text>
              {outputValueInQuote && (
                <Text variant="label02" color="ink.text-subdued">
                  {outputValueInQuote}
                </Text>
              )}
            </Box>
          }
        />
      </TokenStatCard>
    </TokenDetailsCard>
  );
}
