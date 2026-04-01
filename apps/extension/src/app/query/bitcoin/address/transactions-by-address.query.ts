import { useQueries } from '@tanstack/react-query';

import { createGetBitcoinTransactionsByAddressQueryOptions } from '@leather.io/query';

import { useBitcoinClient } from '../clients/bitcoin-client';

/** @knipignore */
export function createBitcoinTransactionsByAddressListQueries(addresses: string[], client: any) {
  return addresses.map(address =>
    createGetBitcoinTransactionsByAddressQueryOptions({ address, client })
  );
}

export function useGetBitcoinTransactionsByAddressListQuery(addresses: string[]) {
  const client = useBitcoinClient();

  return useQueries({
    queries: createBitcoinTransactionsByAddressListQueries(addresses, client),
  });
}
