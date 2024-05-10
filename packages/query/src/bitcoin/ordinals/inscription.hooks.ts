import { useGetInscriptionQuery } from './inscription.query';
import { createInscriptionHiro } from './inscription.utils';

export function useInscription(id: string) {
  return useGetInscriptionQuery(id, {
    select: resp => createInscriptionHiro(resp),
  });
}
