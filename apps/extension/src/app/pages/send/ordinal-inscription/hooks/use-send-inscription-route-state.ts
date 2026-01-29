import { useLocation } from 'react-router';

import type { InscriptionAsset } from '@leather.io/models';

export function useSendInscriptionRouteState() {
  const location = useLocation();
  return {
    inscription: ((location.state as any)?.inscription ?? null) as InscriptionAsset | null,
  };
}
