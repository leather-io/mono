import { TransactionInput } from '@scure/btc-signer/psbt';
import { useQuery } from '@tanstack/react-query';

import { BitcoinTx } from '@leather.io/models';
import { isUndefined } from '@leather.io/utils';

import { InscriptionResponseHiro } from '../../../types/inscription';
import { createHiroInscription } from './inscription.utils';
import {
  createGetInscriptionsByParamQueryOptions,
  useGetInscriptionsByOutputList,
} from './inscriptions-by-param.query';

export function useInscriptionByOutput(transaction: BitcoinTx) {
  const inputsLength = transaction.vin.length;
  const index = inputsLength === 1 ? 0 : inputsLength - 2;
  const isPending = !transaction.status.confirmed;
  const id = isPending ? transaction.vin[index].txid : transaction.txid;
  const param = `output=${id}:${index}`;

  return useQuery({
    ...createGetInscriptionsByParamQueryOptions({ isPending, param }),
    select(resp) {
      const inscriptionResponse = resp.results[0];
      if (!inscriptionResponse) return;
      return createHiroInscription(inscriptionResponse);
    },
  });
}

export function useInscriptionsByOutputs(inputs: TransactionInput[]) {
  return useGetInscriptionsByOutputList(inputs)
    .map(query => query.data?.results[0])
    .filter(
      (inscriptionResponse): inscriptionResponse is InscriptionResponseHiro =>
        !isUndefined(inscriptionResponse)
    )
    .map(inscriptionResponse => createHiroInscription(inscriptionResponse));
}
