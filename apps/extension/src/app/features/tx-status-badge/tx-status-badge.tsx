import { useQuery } from '@tanstack/react-query';
import { Box } from 'leather-styles/jsx';

import { createStacksTransactionByIdQueryConfig } from '@leather.io/queries';
import { Badge, Spinner } from '@leather.io/ui';
import { capitalize } from '@leather.io/utils';

import { statusFromTx } from '@app/common/transactions/stacks/transaction.utils';
import { useUserSettings } from '@app/hooks/use-user-settings';

export function TxStatusBadge({ txid }: { txid: string }) {
  const settings = useUserSettings();
  const { data } = useQuery({
    ...createStacksTransactionByIdQueryConfig(txid, settings),
    refetchInterval(query) {
      if (!query.state.data || query.state.data.status === 'pending') return 3000;
      return false;
    },
  });

  if (!data || data.status === 'pending')
    return (
      <Badge
        label="In mempool"
        icon={
          <Box transform="scale(0.65) translateY(2px)" display="inline-block">
            <Spinner />
          </Box>
        }
      />
    );

  if (statusFromTx(data) === 'failed')
    return <Badge variant="error" label={capitalize(data.status.replaceAll('_', ' '))} />;

  return <Badge variant="success" label="Confirmed" />;
}
