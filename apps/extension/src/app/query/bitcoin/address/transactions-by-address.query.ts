import { useQueries } from '@tanstack/react-query';

import { createGetBitcoinTransactionsByAddressQueryOptions } from '@leather.io/query';
import { uniqueArray } from '@leather.io/utils';

import { useBitcoinClient } from '../clients/bitcoin-client';

export function useGetBitcoinTransactionsByAddressListQuery(addresses: string[]) {
  const client = useBitcoinClient();
  const uniqueAddresses = uniqueArray(addresses);

  return useQueries({
    queries: uniqueAddresses.map(address => {
      return createGetBitcoinTransactionsByAddressQueryOptions({ address, client });
    }),
  });
}
