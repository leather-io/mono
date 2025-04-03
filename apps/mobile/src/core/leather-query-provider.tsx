import { ReactNode } from 'react';

import { LeatherQueryProvider as LeatherProvider } from '@/queries/leather-query-provider';
import { queryClient } from '@/queries/query';
import { GITHUB_ORG, GITHUB_REPO } from '@/shared/constants';
import { BRANCH_NAME, isProduction } from '@/shared/environment';
import { useSettings } from '@/store/settings/settings';

interface LeatherQueryProviderProps {
  children: ReactNode;
}

export function LeatherQueryProvider({ children }: LeatherQueryProviderProps) {
  const { networkPreference } = useSettings();
  return (
    <LeatherProvider
      client={queryClient}
      network={networkPreference}
      environment={{
        env: isProduction() ? 'production' : 'development',
        github: {
          org: GITHUB_ORG,
          repo: GITHUB_REPO,
          branchName: BRANCH_NAME,
        },
      }}
    >
      {children}
    </LeatherProvider>
  );
}
