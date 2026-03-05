import { useQuery } from '@tanstack/react-query';

import { createBlockchainActivityView } from '@leather.io/features';
import type { AccountAddresses } from '@leather.io/models';
import { createBlockchainActivityQueryConfig } from '@leather.io/queries';
import type { ActivityResponse } from '@leather.io/services';

import { useUserSettings } from '@app/hooks/use-user-settings';

export function useBlockchainActivity(account: AccountAddresses) {
  const settings = useUserSettings();
  return useQuery({
    ...createBlockchainActivityQueryConfig({ account }, settings),
    select: (response: ActivityResponse) =>
      response.items.map(item => createBlockchainActivityView(item, settings.network)),
  });
}
