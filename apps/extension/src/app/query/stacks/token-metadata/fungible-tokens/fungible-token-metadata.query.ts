import { useQuery } from '@tanstack/react-query';

import { createStacksFungibleTokenMetadataQueryConfig } from '@leather.io/queries';

import { useUserSettings } from '@app/hooks/use-user-settings';

export function useGetFungibleTokenMetadataQuery(address: string) {
  const settings = useUserSettings();
  return useQuery(createStacksFungibleTokenMetadataQueryConfig(address, settings));
}
