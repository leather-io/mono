import { useMarketDataQuery } from '@/queries/market-data/market-data.query';
import { formatCurrency } from '@/utils/currency-formatter';
import { t } from '@lingui/core/macro';

import { stxAsset } from '@leather.io/constants';
import { Money } from '@leather.io/models';
import { Box, Text } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuote } from '@leather.io/utils';

import { TokenDetailsCard } from '../components/token-details-card';
import { TokenStatCard, TokenStatCardItem } from '../components/token-stat-card';

interface Sip9TokenStatsProps {
  floorPrice?: Money;
  latestSale?: Money;
}
export function Sip9TokenStats({ floorPrice, latestSale }: Sip9TokenStatsProps) {
  const marketData = useMarketDataQuery(stxAsset);
  if (!marketData.data) return null;
  const latestSaleInQuote = latestSale
    ? baseCurrencyAmountInQuote(latestSale, marketData.data)
    : undefined;
  const floorPriceInQuote = floorPrice
    ? baseCurrencyAmountInQuote(floorPrice, marketData.data)
    : undefined;
  return (
    <TokenDetailsCard>
      <TokenStatCard>
        {latestSale && latestSaleInQuote && (
          <TokenStatCardItem
            label={t`Recent sale`}
            value={
              <Box flexDirection="column" gap="1">
                <Text variant="label01">{formatCurrency(latestSale)}</Text>
                <Text variant="label02" color="ink.text-subdued">
                  {formatCurrency(latestSaleInQuote)}
                </Text>
              </Box>
            }
          />
        )}
        {floorPrice && floorPriceInQuote && (
          <TokenStatCardItem
            label={t`Floor price`}
            value={
              <Box flexDirection="column" gap="1">
                <Text variant="label01">{formatCurrency(floorPrice)}</Text>
                <Text variant="label02" color="ink.text-subdued">
                  {formatCurrency(floorPriceInQuote)}
                </Text>
              </Box>
            }
          />
        )}
      </TokenStatCard>
    </TokenDetailsCard>
  );
}
