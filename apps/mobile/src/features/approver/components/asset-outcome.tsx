import { TokenBalance } from '@/features/token/components/token-balance';
import { useMarketDataQuery } from '@/queries/market-data/market-data.query';

import { Sip10Asset } from '@leather.io/models';
import { Sip10AvatarIcon } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuote, createMoney } from '@leather.io/utils';

export function AssetOutcomeBalance({ asset, amount }: { asset: Sip10Asset; amount: number }) {
  const marketData = useMarketDataQuery(asset);
  if (!marketData.data) return null;

  const baseAmount = createMoney(amount, marketData.data.pair.base, asset.decimals);
  const resultAmount = baseCurrencyAmountInQuote(baseAmount, marketData.data);

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
