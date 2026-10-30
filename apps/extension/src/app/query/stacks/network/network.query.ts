import { useQuery } from '@tanstack/react-query';

import { createStacksNetworkStatusQueryConfig } from '@leather.io/queries';

import { useUserSettings } from '@app/hooks/use-user-settings';

export function useGetStacksNetworkStatusQuery(url: string) {
  const settings = useUserSettings();
  return useQuery(createStacksNetworkStatusQueryConfig(url, settings));
}
