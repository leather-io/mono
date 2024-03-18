import {
  getNativeSegwitAddressIndexDerivationPath,
  getTaprootAddress,
} from '@leather-wallet/bitcoin';
import { createCounter } from '@leather-wallet/utils';
import { HDKey } from '@scure/bip32';
import { useQuery } from '@tanstack/react-query';

import { UtxoResponseItem, UtxoWithDerivationPath } from '../../../types/utxo';
import { useLeatherNetwork } from '../../leather-query-provider';
import type { AppUseQueryConfig } from '../../query-config';
import { QueryPrefixes } from '../../query-prefixes';
import { useBitcoinClient } from '../bitcoin-client';
import { hasInscriptions } from './address.utils';

const staleTime = 3 * 60 * 1000;

const queryOptions = { staleTime, refetchOnWindowFocus: false };

export function useGetUtxosByAddressQuery<T extends unknown = UtxoResponseItem[]>(
  address: string,
  options?: AppUseQueryConfig<UtxoResponseItem[], T>
) {
  const client = useBitcoinClient();
  return useQuery({
    enabled: !!address,
    queryKey: ['btc-utxos-by-address', address],
    queryFn: () => client.addressApi.getUtxosByAddress(address),
    ...queryOptions,
    ...options,
  });
}

const stopSearchAfterNumberAddressesWithoutUtxos = 20;

/**
 * Returns all utxos for the user's current taproot account. The search for
 * utxos iterates through all addresses until a sufficiently large number of
 * empty addresses is found.
 */
export function useTaprootAccountUtxosQuery({
  taprootKeychain,
  currentAccountIndex,
}: {
  taprootKeychain: HDKey | undefined;
  currentAccountIndex: number;
}) {
  const network = useLeatherNetwork();
  const client = useBitcoinClient();

  return useQuery(
    [QueryPrefixes.TaprootAddressUtxos, currentAccountIndex, network.id],
    async () => {
      let currentNumberOfAddressesWithoutUtxos = 0;
      const addressIndexCounter = createCounter(0);
      let foundUnspentTransactions: UtxoWithDerivationPath[] = [];
      while (currentNumberOfAddressesWithoutUtxos < stopSearchAfterNumberAddressesWithoutUtxos) {
        const address = getTaprootAddress({
          index: addressIndexCounter.getValue(),
          keychain: taprootKeychain,
          network: network.chain.bitcoin.bitcoinNetwork,
        });

        const unspentTransactions = await client.addressApi.getUtxosByAddress(address);

        if (!hasInscriptions(unspentTransactions)) {
          currentNumberOfAddressesWithoutUtxos += 1;
          addressIndexCounter.increment();
          continue;
        }

        foundUnspentTransactions = [
          ...unspentTransactions.map(utxo => {
            const addressIndex = addressIndexCounter.getValue();
            return {
              // adds addresss index of which utxo belongs
              ...utxo,
              addressIndex,
              derivationPath: getNativeSegwitAddressIndexDerivationPath(
                network.chain.bitcoin.bitcoinNetwork,
                currentAccountIndex,
                addressIndex
              ),
            };
          }),
          ...foundUnspentTransactions,
        ];

        currentNumberOfAddressesWithoutUtxos = 0;
        addressIndexCounter.increment();
      }
      return foundUnspentTransactions;
    },
    {
      refetchInterval: 15000,
      refetchOnWindowFocus: false,
    }
  );
}
