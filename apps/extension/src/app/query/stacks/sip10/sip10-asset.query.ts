import { useQuery } from '@tanstack/react-query';

import { createSip10AssetByPrincipalQueryConfig } from '@leather.io/queries';

import { useUserSettings } from '@app/hooks/use-user-settings';

export function useGetSip10AssetByPrincipalQuery(principal: string) {
  const settings = useUserSettings();
  return useQuery(createSip10AssetByPrincipalQueryConfig(principal, settings));
}
