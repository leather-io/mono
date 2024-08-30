import { useQuery } from '@tanstack/react-query';

import { useBitcoinClient } from '../clients/bitcoin-client';
import { createGetInscriptionQueryOptions } from './inscription.query';
import { createBestInSlotInscription } from './inscription.utils';

export function useInscription(id: string) {
  const client = useBitcoinClient();
  return useQuery({
    ...createGetInscriptionQueryOptions(id, client.BestInSlotApi),
    select: resp => createBestInSlotInscription(resp.data),
  });
}
