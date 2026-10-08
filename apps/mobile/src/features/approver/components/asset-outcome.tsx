import { TokenBalance } from '@/features/token/components/token-balance';
import { useMarketDataQuery } from '@/queries/market-data/market-data.query';

import { Sip10Asset } from '@leather.io/models';
import { Sip10AvatarIcon } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuote, createMoney } from '@leather.io/utils';

interface AssetOutcomeBalanceProps {
  asset: Sip10Asset;
  amount: bigint;
}
export function AssetOutcomeBalance({ asset, amount }: AssetOutcomeBalanceProps) {
  const marketData = useMarketDataQuery(asset).data;

  const baseAmount = createMoney(amount, marketData?.pair.base ?? asset.symbol, asset.decimals);
  const resultAmount = marketData ? baseCurrencyAmountInQuote(baseAmount, marketData) : undefined;

  return (
    <TokenBalance
      mx="-5"
      icon={
        <Sip10AvatarIcon
          contractId={asset.contractId}
          imageCanonicalUri={asset.imageCanonicalUri}
          name={asset.name}
        />
      }
      availableBalance={baseAmount}
      quoteBalance={resultAmount}
      tokenName={asset.name}
      ticker={asset.symbol}
    />
  );
}
