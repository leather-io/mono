import { useEffect } from 'react';
import { useNavigate } from 'react-router';

import { useQueryClient } from '@tanstack/react-query';
import { Flex, HStack, Stack, styled } from 'leather-styles/jsx';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';
import { pox5NetworkConfig } from '~/data/pox5-network-config';
import { useToast } from '~/features/toasts/use-toast';
import { Page } from '~/layouts/page/page';
import { makeExplorerTxLink, openExternalLink } from '~/utils/external-links';

import { Button, ErrorCircleIcon, ExternalLinkIcon, Flag, LoadingSpinner } from '@leather.io/ui';

import { Pox5TrackedTx, usePox5TxTracker } from '../hooks/use-pox5-tx-tracker';
import { usePox5TransactionQuery } from '../queries/pox5-stacking.query';
import { getPox5TxScreenState } from '../transactions/pox5-tx-status';

const pox5RefreshQueryKeyPrefixes = [
  'pox5-staker-info',
  'pox5-pending-tx',
  'pox5-earned-rewards',
  'pox5-payout-preference',
  'get-stx-address-balance',
];

interface Pox5TxStatusScreenProps {
  trackedTx: Pox5TrackedTx;
}

export function Pox5TxStatusScreen({ trackedTx }: Pox5TxStatusScreenProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const toast = useToast();
  const { clear } = usePox5TxTracker();
  const transactionQuery = usePox5TransactionQuery(trackedTx.txId);

  const { transactionStatus } = bitcoinStakingContent;
  const kindCopy = transactionStatus.byKind[trackedTx.kind];
  const state = getPox5TxScreenState({
    outcome: transactionQuery.data,
    startedAt: trackedTx.startedAt,
    now: transactionQuery.dataUpdatedAt || trackedTx.startedAt,
  });
  const isConfirmed = state.status === 'confirmed';

  useEffect(() => {
    if (!isConfirmed) return;

    async function settleConfirmedTransaction() {
      await queryClient.invalidateQueries({
        refetchType: 'all',
        predicate: query =>
          pox5RefreshQueryKeyPrefixes.some(prefix => query.queryKey[0] === prefix),
      });
      toast.success(kindCopy.confirmedToast);
      if (trackedTx.destination) await navigate(trackedTx.destination, { replace: true });
      clear();
    }

    void settleConfirmedTransaction();
  }, [
    isConfirmed,
    clear,
    kindCopy.confirmedToast,
    navigate,
    queryClient,
    toast,
    trackedTx.destination,
  ]);

  const explorerAction = (
    <Button
      variant="ghost"
      size="sm"
      iconEnd={ExternalLinkIcon}
      onClick={() =>
        openExternalLink(makeExplorerTxLink(trackedTx.txId, pox5NetworkConfig.stacksNetworkName))
      }
      data-testid="pox5-tx-explorer-link"
    >
      {transactionStatus.viewInExplorer}
    </Button>
  );

  if (state.status === 'failed') {
    return (
      <Page>
        <Page.Header title={transactionStatus.headerTitle} onBack={clear} />
        <Flex justifyContent="center" py="space.09" data-testid="pox5-tx-status-failed">
          <Stack gap="space.04" maxWidth="60ch">
            <Flag img={<ErrorCircleIcon />} align="top">
              <Stack gap="space.01">
                <styled.p textStyle="label.03">{kindCopy.failedTitle}</styled.p>
                <styled.p textStyle="caption.01" color="ink.text-subdued">
                  {transactionStatus.failureReasons[state.reason]}
                </styled.p>
              </Stack>
            </Flag>
            <HStack gap="space.03">
              <Button size="sm" onClick={() => clear()} data-testid="pox5-tx-dismiss-button">
                {transactionStatus.dismiss}
              </Button>
              {explorerAction}
            </HStack>
          </Stack>
        </Flex>
      </Page>
    );
  }

  return (
    <Page>
      <Page.Header title={transactionStatus.headerTitle} />
      <Flex justifyContent="center" py="space.09" data-testid="pox5-tx-status-screen">
        <Stack gap="space.04" alignItems="center" maxWidth="60ch">
          <LoadingSpinner fill="ink.text-subdued" />
          <Stack gap="space.01" textAlign="center">
            <styled.p textStyle="label.03">{kindCopy.pendingTitle}</styled.p>
            <styled.p textStyle="caption.01" color="ink.text-subdued">
              {transactionStatus.pendingDescription}
            </styled.p>
          </Stack>
          {explorerAction}
        </Stack>
      </Flex>
    </Page>
  );
}
