import { useQuery } from '@tanstack/react-query';

import { createAlexSwappableCurrenciesQueryConfig } from '@leather.io/queries';

import { useUserSettings } from '@app/hooks/use-user-settings';

export function useGetAlexSwappableCurrenciesQuery() {
  const settings = useUserSettings();
  return useQuery(createAlexSwappableCurrenciesQueryConfig(settings));
}
