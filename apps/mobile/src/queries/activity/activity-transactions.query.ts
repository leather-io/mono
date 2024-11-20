// useGetBitcoinTxsByAddressListQuery
// activity-list.tsx
//   const [
//     { isLoading: isLoadingNsBitcoinTxs, data: nsBitcoinTxs = [] },
//     { isLoading: isLoadingTrBitcoinTxs, data: trBitcoinTxs = [] },
//   ] = useGetBitcoinTxsByAddressListQuery([nsBitcoinAddress, trBitcoinAddress]);
// useGetBitcoinTxsByAddressListQuery accepts an array of addresses
// we pass in the 2 addresses we want to check - TR + Segwit but no reason not to check more?
// seems like this already does what we want?
// import { useQueries } from '@tanstack/react-query';
// import {
//   createGetBitcoinTxsByAddressQueryOptions,
//   useBitcoinClient,
// } from '@leather.io/query';
// export function useGetBitcoinTxsByAddressListQuery(addresses: string[]) {
//   const client = useBitcoinClient();
//   return useQueries({
//     queries: addresses.map(address => ({
//       ...createGetBitcoinTxsByAddressQueryOptions({ address, client }),
//       queryFn: async ({ signal }: { signal?: AbortSignal }) => {
//         const promises = addresses.map(addr =>
//           client.addressApi.getTransactionsByAddress(addr, signal)
//         );
//         return Promise.all(promises);
//       }
//     }))
//   });
// }
// useGetBitcoinTxsByAddressListQuery is OK
// useBitcoinPendingTransactions -> seems to just filter result of useGetBitcoinTxsByAddressListQuery
// should use a selector to get that if needed, not a query
// Stacks:
// useGetAccountTransactionsWithTransfersQuery => useGetAccountTransactionsWithTransfersQueries in mobile already
// useStacksPendingTransactions => useStacksPendingTransactions in mobile already
// useSubmittedTransactions => is a selector of state.submittedTransactions which is maybe as yet unconfirmed transactions?
import { useGetStacksAddresses } from '@/features/balances/stacks/use-get-stacks-addresses';
import { AccountId } from '@/models/domain.model';
import {
  useBitcoinAccountTotalBitcoinBalance,
  useWalletTotalBitcoinBalance,
} from '@/queries/balance/bitcoin-balance.query';
import { useStxBalance } from '@/queries/balance/stacks-balance.query';

import { Money } from '@leather.io/models';
import { BitcoinTx, StacksTx } from '@leather.io/models';
import { sumMoney } from '@leather.io/utils';

interface Activity {
  stacksTransactions: StacksTx[];
  bitcoinTransactions: BitcoinTx[];
}

interface GetActivityProps {
  bitcoinAddresses: string[];
  stacksAddresses: string[];
}

export function useGetActivity({ bitcoinAddresses, stacksAddresses }: GetActivityProps): Activity {
  const { availableBalance: stxBalance, fiatBalance: stxBalanceUsd } =
    useStxBalance(stacksAddresses);
  const { availableBalance: btcBalance, fiatBalance: btcBalanceUsd } =
    useWalletTotalBitcoinBalance();

  const totalBalance = sumMoney([btcBalanceUsd, stxBalanceUsd]);
  return {};
}

interface GetAccountActivityProps {
  accountId: AccountId;
}

export function useAccountActivity(accountId: GetAccountActivityProps): [BitcoinTx[], StacksTx[]] {
  const stacksAddresses = useGetStacksAddresses(accountId);
  const { availableBalance: stxBalance, fiatBalance: stxBalanceUsd } =
    useStxBalance(stacksAddresses);
  const { availableBalance: btcBalance, fiatBalance: btcBalanceUsd } =
    useBitcoinAccountTotalBitcoinBalance(accountId);

  const totalBalance = sumMoney([btcBalanceUsd, stxBalanceUsd]);
  return {
    btcBalance,
    btcBalanceUsd,
    stxBalance,
    stxBalanceUsd,
    totalBalance,
  };
}
