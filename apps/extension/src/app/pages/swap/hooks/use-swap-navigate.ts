import { useCallback } from 'react';

import { replaceRouteParams } from '@shared/utils/replace-route-params';

import { useNavigate, useParams } from '@app/routes/compat';

export function useSwapNavigate() {
  const { base, quote } = useParams();
  const navigate = useNavigate();

  return useCallback(
    (route: string) => {
      void navigate(
        replaceRouteParams(route, {
          base: base ?? '',
          quote: quote ?? '',
        })
      );
    },
    [base, navigate, quote]
  );
}
