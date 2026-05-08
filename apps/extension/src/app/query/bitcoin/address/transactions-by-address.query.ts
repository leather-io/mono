import { createGetBitcoinTransactionsByAddressQueryOptions } from '@leather.io/query';

export function createBitcoinTransactionsByAddressListQueries(addresses: string[], client: any) {
  return addresses.map(address =>
    createGetBitcoinTransactionsByAddressQueryOptions({ address, client })
  );
}
