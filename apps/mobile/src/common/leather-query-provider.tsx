import { queryClient } from '@/queries/query';
import { GITHUB_ORG, GITHUB_REPO } from '@/shared/constants';
import { BRANCH_NAME, WALLET_ENVIRONMENT } from '@/shared/environment';
import { useSettings } from '@/store/settings/settings';

import { LeatherQueryProvider as LeatherProvider } from '@leather.io/query';
import { HasChildren } from '@leather.io/ui/native';

export function LeatherQueryProvider({ children }: HasChildren) {
  const { networkPreference } = useSettings();
  return (
    <LeatherProvider
      client={queryClient}
      network={networkPreference}
      environment={{
        env: WALLET_ENVIRONMENT,
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
