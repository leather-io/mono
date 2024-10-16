// import { AccountId } from '@/models/domain.model';
import { QueryObserverResult } from '@tanstack/react-query';

import { Money, StxCryptoAssetBalance } from '@leather.io/models';
import { useCryptoCurrencyMarketDataMeanAverage } from '@leather.io/query';
import { baseCurrencyAmountInQuote, createMoney } from '@leather.io/utils';

import { useStxBalancesQueries } from './use-stx-balances.query';

interface StxBalances {
  totalStxBalance: Money;
  accounts: QueryObserverResult<StxCryptoAssetBalance, unknown>[];
}

function useGetStxBalanceByAddresses(addresses: string[]): StxBalances {
  const { totalData, queries } = useStxBalancesQueries(addresses);

  if (!addresses || addresses.length === 0)
    return { totalStxBalance: createMoney(0, 'STX'), accounts: [] };

  return {
    totalStxBalance: totalData,
    accounts: queries, // TODO as yet unused but perhaps useful
  };
}

export function useStxBalance(addresses: string[]) {
  const { totalStxBalance } = useGetStxBalanceByAddresses(addresses);
  const stxMarketData = useCryptoCurrencyMarketDataMeanAverage('STX');
  const stxBalanceUsd = baseCurrencyAmountInQuote(totalStxBalance, stxMarketData);
  return { availableBalance: totalStxBalance, fiatBalance: stxBalanceUsd };
}

// export function useWalletTotalStacksBalance() {
//   //   const descriptors = useStacksDescriptors();
//   //   return useTotalStacksBalanceOfDescriptors(descriptors);
//   return null;
// }

// export function useStacksAccountTotalStacksBalance({ fingerprint, accountIndex }: AccountId) {
//   //   const descriptors = useStacksDescriptorsByAcccount(fingerprint, accountIndex);
//   //   return useTotalStacksBalanceOfDescriptors(descriptors);
//   return null;
// }
