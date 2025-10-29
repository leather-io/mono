import { useLocation } from 'react-router';

import get from 'lodash.get';

import type { InscriptionAsset } from '@leather.io/models';

export function useSendInscriptionRouteState() {
  const location = useLocation();
  return {
    inscription: get(location.state, 'inscription', null) as InscriptionAsset | null,
  };
}
