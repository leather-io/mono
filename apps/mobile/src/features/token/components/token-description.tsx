import { t } from '@lingui/core/macro';

import { Text } from '@leather.io/ui/native';

import { TokenDetailsCard } from './token-details-card';

export function TokenDescription({ children }: { children: React.ReactNode }) {
  return (
    <TokenDetailsCard title={t`Description`}>
      <Text variant="caption01">{children}</Text>
    </TokenDetailsCard>
  );
}
