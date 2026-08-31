import { Box } from 'leather-styles/jsx';
import { EM_DASH } from '~/constants/constants';
import { useMarketDataQuery } from '~/queries/market-data/market-data.query';
import { formatCurrency } from '~/utils/currency-formatter';
import { toHumanReadableMicroStx } from '~/utils/unit-convert';

import { stxAsset } from '@leather.io/constants';
import { SkeletonLoader } from '@leather.io/ui';
import { baseCurrencyAmountInQuote, createMoney } from '@leather.io/utils';

import { usePox5PoolTotalStaked } from '../queries/pox5-stacking.query';

interface PoolTvlValueProps {
  signerManagerContractIds: string[];
  testId: string;
}

export function PoolTvlValue({ signerManagerContractIds, testId }: PoolTvlValueProps) {
  const { isLoading, totalStakedMicroStx } = usePox5PoolTotalStaked(signerManagerContractIds);
  const marketDataQuery = useMarketDataQuery(stxAsset);

  if (isLoading) return <SkeletonLoader isLoading w={40} h={16} />;
  if (totalStakedMicroStx === null) return <Box data-testid={testId}>{EM_DASH}</Box>;

  const usdValue = marketDataQuery.data
    ? baseCurrencyAmountInQuote(createMoney(totalStakedMicroStx, 'STX'), marketDataQuery.data)
    : null;

  return (
    <>
      <Box data-testid={testId}>{toHumanReadableMicroStx(totalStakedMicroStx, 0)}</Box>
      {usdValue && (
        <Box data-testid={`${testId}-usd`} textStyle="label.03" color="ink.text-subdued">
          {formatCurrency(usdValue)}
        </Box>
      )}
    </>
  );
}
