import { Inscription } from '@leather.io/models';

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
  return ['inscriptions', xpub.substring(0, 32)];
}
