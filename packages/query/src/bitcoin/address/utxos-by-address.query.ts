import { HDKey } from '@scure/bip32';
import type { QueryFunctionContext } from '@tanstack/react-query';

import { getTaprootAddress, makeNativeSegwitAddressIndexDerivationPath } from '@leather.io/bitcoin';
import { NetworkConfiguration } from '@leather.io/models';
import { createCounter, oneWeekInMs } from '@leather.io/utils';

import { UtxoWithDerivationPath } from '../../../types/utxo';
import { BitcoinQueryPrefixes } from '../../query-prefixes';
import { BitcoinClient } from '../clients/bitcoin-client';
import { hasInscriptions } from './address.utils';

const staleTime = 3 * 60 * 1000;

const queryOptions = { staleTime, gcTime: oneWeekInMs, refetchOnWindowFocus: false };

interface CreateGetUtxosByAddressQueryOptionsArgs {
  address: string;
  client: BitcoinClient;
}
export function createGetUtxosByAddressQueryOptions({
  address,
  client,
}: CreateGetUtxosByAddressQueryOptionsArgs) {
  return {
    enabled: !!address,
    queryKey: [BitcoinQueryPrefixes.GetUtxosByAddress, client.networkName, address],
    queryFn: ({ signal }: QueryFunctionContext) =>
      client.addressApi.getUtxosByAddress(address, signal),
    ...queryOptions,
  } as const;
}

const stopSearchAfterNumberAddressesWithoutUtxos = 5;

interface CreateGetTaprootUtxosByAddressQueryOptionsArgs {
  client: BitcoinClient;
  currentAccountIndex: number;
  network: NetworkConfiguration;
  taprootKeychain: HDKey | undefined;
}
export function createGetTaprootUtxosByAddressQueryOptions({
  client,
  currentAccountIndex,
  network,
  taprootKeychain,
}: CreateGetTaprootUtxosByAddressQueryOptionsArgs) {
  return {
    queryKey: [
      BitcoinQueryPrefixes.GetTaprootUtxosByAddress,
      client.networkName,
      currentAccountIndex,
      network.id,
    ],
    queryFn: async () => {
      let currentNumberOfAddressesWithoutUtxos = 0;
      const addressIndexCounter = createCounter(0);
      let foundUnspentTransactions: UtxoWithDerivationPath[] = [];
      while (currentNumberOfAddressesWithoutUtxos < stopSearchAfterNumberAddressesWithoutUtxos) {
        const address = getTaprootAddress({
          index: addressIndexCounter.getValue(),
          keychain: taprootKeychain,
          network: network.chain.bitcoin.mode,
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
              derivationPath: makeNativeSegwitAddressIndexDerivationPath(
                network.chain.bitcoin.mode,
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
    refetchInterval: 15000,
    refetchOnWindowFocus: false,
  } as const;
}
