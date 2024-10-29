import { Inscription } from '@leather.io/models';

import { BitcoinClient } from '../clients/bitcoin-client';

interface FindInscriptionsOnUtxoArgs {
  index: number;
  inscriptions: Inscription[];
  txId: string;
}
export function findInscriptionsOnUtxo({ index, inscriptions, txId }: FindInscriptionsOnUtxoArgs) {
  return inscriptions?.filter(
    inscription => `${txId}:${index.toString()}` === `${inscription.txid}:${inscription.output}`
  );
}

export function createInscriptionByXpubQueryKey(xpub: string) {
  return ['inscriptions', xpub.substring(0, 12)];
}

export function createInscriptionByXpubQuery(client: BitcoinClient, xpub: string) {
  return {
    queryKey: createInscriptionByXpubQueryKey(xpub),
    queryFn: () => client.BestInSlotApi.getInscriptionsByXpub(xpub),
    refetchOnWindowFocus: false,
    staleTime: 1000 * 60 * 5,
  } as const;
}
