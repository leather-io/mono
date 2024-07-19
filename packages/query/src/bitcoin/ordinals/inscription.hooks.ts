import { useQuery } from '@tanstack/react-query';

import { createGetInscriptionQueryOptions } from './inscription.query';
import { createHiroInscription } from './inscription.utils';

export function useInscription(id: string) {
  return useQuery({
    ...createGetInscriptionQueryOptions(id),
    select: resp => createHiroInscription(resp),
  });
}
