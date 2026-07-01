import { useMemo } from 'react';

import type { AccountRequest } from '@leather.io/services';

import { useCurrentAccountAddresses } from './use-account-addresses';

export function useAccountRequest(): AccountRequest {
  const account = useCurrentAccountAddresses();

  return useMemo(() => ({ account }), [account]);
}
