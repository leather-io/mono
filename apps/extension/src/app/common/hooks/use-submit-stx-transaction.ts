import { useCallback } from 'react';

import { AuthType, StacksTransactionWire, broadcastTransaction } from '@stacks/transactions';

import { delay, isError } from '@leather.io/utils';

import { logger } from '@shared/logger';
import { analytics } from '@shared/utils/analytics';

import { useRefreshAllAccountData } from '@app/common/hooks/account/use-refresh-all-account-data';
import { sponsoredTransactionBroadcastRefusedMessage } from '@app/common/transactions/stacks/sbtc-sponsorship.utils';
import { hiroFetchWrapper } from '@app/query/stacks/stacks-client';
import { useCurrentStacksNetworkState } from '@app/store/networks/networks.hooks';
import { useLoading } from '@app/store/ui/ui.hooks';

const timeForApiToUpdate = 250;

interface UseSubmitTransactionArgs {
  loadingKey: string;
}
interface UseSubmitTransactionCallbackArgs {
  replaceByFee?: boolean;
  onSuccess(txId: string): void;
  onError(error: Error | string): void;
}
export function useSubmitTransactionCallback({ loadingKey }: UseSubmitTransactionArgs) {
  const refreshAccountData = useRefreshAllAccountData();
  const { setIsLoading, setIsIdle } = useLoading(loadingKey);
  const stacksNetwork = useCurrentStacksNetworkState();

  return useCallback(
    ({ onSuccess, onError }: UseSubmitTransactionCallbackArgs) =>
      async (transaction: StacksTransactionWire) => {
        if (transaction.auth.authType === AuthType.Sponsored) {
          logger.error('Refusing to broadcast a sponsored transaction');
          onError(sponsoredTransactionBroadcastRefusedMessage);
          return;
        }
        setIsLoading();
        try {
          const response = await broadcastTransaction({
            transaction,
            network: stacksNetwork,
            client: { fetch: hiroFetchWrapper },
          });

          if ('error' in response) {
            logger.error('Transaction failed to broadcast', response);
            onError(response.error);
            return setIsIdle();
          }

          if (!response.txid) {
            logger.error('Transaction failed to broadcast', response);
            return setIsIdle();
          }

          logger.info('Transaction broadcast', response);

          await delay(500);

          analytics.track('broadcast_transaction', {
            symbol: 'stx',
          });
          onSuccess(response.txid);
          setIsIdle();
          await refreshAccountData(timeForApiToUpdate);
          return { txid: response.txid, transaction };
        } catch (error) {
          logger.error('Transaction callback', { error });
          onError(isError(error) ? error : { name: '', message: '' });
          return setIsIdle();
        }
      },
    [setIsLoading, stacksNetwork, setIsIdle, refreshAccountData]
  );
}
