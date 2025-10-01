import { TokenBalance } from '@/features/token/components/token-balance';
import { useSip10BalanceByContractId } from '@/queries/balance/sip10-balance.query';
import { useMarketDataQuery } from '@/queries/market-data/market-data.query';
import { useGetContractInterface } from '@/queries/stacks/contract-interface.query';
import { deserializeAccountId } from '@/store/accounts/accounts';
import { deserializeTransaction } from '@stacks/transactions';

import { Sip10Asset } from '@leather.io/models';
import { getSip10TransferAmount } from '@leather.io/stacks';
import { Sip10AvatarIcon } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuote, createMoney } from '@leather.io/utils';

import { assertContractCallPayload, getContractAddress } from '../utils';

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

export function AssetOutcome({ txHex, accountId }: { txHex: string; accountId: string }) {
  const tx = deserializeTransaction(txHex);
  assertContractCallPayload(tx.payload);

  const contractAddress = getContractAddress(tx.payload);
  const { functionArgs, functionName, contractName } = tx.payload;

  const { data: contractInterfaceData } = useGetContractInterface(
    contractAddress,
    contractName.content
  );
  const { fingerprint, accountIndex } = deserializeAccountId(accountId);
  const sip10 = useSip10BalanceByContractId(
    fingerprint,
    accountIndex,
    `${contractAddress}.${contractName.content}`
  );

  if (!contractInterfaceData) return null;

  const transferAmount = getSip10TransferAmount({
    functionName: functionName.content,
    functionArgs,
    contractInterfaceData,
  });

  if (!transferAmount) return null;

  if (!sip10.value) return null;

  return <AssetOutcomeBalance asset={sip10.value.asset} amount={transferAmount} />;
}
