import { useQuery } from '@tanstack/react-query';

import type { AccountAddresses } from '@leather.io/models';
import { createAccountCollectiblesQueryConfig } from '@leather.io/queries';

import { useUserSettings } from '@app/hooks/use-user-settings';

export function useAccountCollectibles(account: AccountAddresses) {
  const settings = useUserSettings();

  return useQuery({
    ...createAccountCollectiblesQueryConfig({ account }, settings),
  });
}
