// import { useCallback } from 'react';

// import { useQueries } from '@tanstack/react-query';

// import { BitcoinTx } from '@leather.io/models';
// import { createGetBitcoinTransactionsByAddressQueryOptions } from '@leather.io/query';

// import { useBitcoinClient } from '../clients/bitcoin-client';

// function useFilterAddressPendingTransactions() {
//   return useCallback((txs: BitcoinTx[]) => txs.filter(tx => !tx.status.confirmed), []);
// }
// TODO: double check if this is needed
// export function useBitcoinPendingTransactions(addresses: string[]) {
//   const filterPendingTransactions = useFilterAddressPendingTransactions();
//   const client = useBitcoinClient();

//   return useQueries({
//     queries: addresses.map(address => ({
//       ...createGetBitcoinTransactionsByAddressQueryOptions({ address, client }),
//       select: (resp: BitcoinTx[]) => filterPendingTransactions(resp),
//     })),
//   });
// }
