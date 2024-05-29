import { BitcoinTx } from '@leather-wallet/models';
import { isUndefined } from '@leather-wallet/utils';
import { TransactionInput } from '@scure/btc-signer/psbt';

import { InscriptionResponseHiro } from '../../../types/inscription';
import { createInscriptionHiro } from './inscription.utils';
import {
  useGetInscriptionsByOutputQueries,
  useGetInscriptionsByOutputQuery,
} from './inscriptions-by-param.query';

export function useInscriptionByOutput(transaction: BitcoinTx) {
  return useGetInscriptionsByOutputQuery(transaction, {
    select(data) {
      const inscriptionResponse = data.results[0];
      if (!inscriptionResponse) return;
      return createInscriptionHiro(inscriptionResponse);
    },
  });
}

export function useInscriptionsByOutputs(inputs: TransactionInput[]) {
  return useGetInscriptionsByOutputQueries(inputs)
    .map(query => query.data?.results[0])
    .filter(
      (inscriptionResponse): inscriptionResponse is InscriptionResponseHiro =>
        !isUndefined(inscriptionResponse)
    )
    .map(inscriptionResponse => createInscriptionHiro(inscriptionResponse));
}
