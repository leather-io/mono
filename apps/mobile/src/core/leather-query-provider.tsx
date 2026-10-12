import { ReactNode } from 'react';

import { LeatherQueryProvider as LeatherProvider } from '@/queries/leather-query-provider';
import { queryClient } from '@/queries/query';
import { useSettings } from '@/store/settings/settings';

interface LeatherQueryProviderProps {
  children: ReactNode;
}

export function LeatherQueryProvider({ children }: LeatherQueryProviderProps) {
  const { networkPreference } = useSettings();
  return (
    <LeatherProvider client={queryClient} network={networkPreference}>
      {children}
    </LeatherProvider>
  );
}
