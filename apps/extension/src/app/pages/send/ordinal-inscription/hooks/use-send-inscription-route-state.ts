import { useSelector } from 'react-redux';

import type { RootState } from '@app/store';

export function useSendInscriptionRouteState() {
  const inscriptionFlow = useSelector((state: RootState) => state.navigation.send.inscriptionFlow);
  return {
    inscription: inscriptionFlow?.inscription ?? null,
  };
}
