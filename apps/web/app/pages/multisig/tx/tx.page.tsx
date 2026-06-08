import { useState } from 'react';
import { useParams } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { Page } from '~/layouts/page/page';

import { AvatarCircle } from '../components/avatar-circle';
import { MultisigErrorState } from '../components/multisig-error-state';
import { MultisigHero } from '../components/multisig-hero';
import { useMultisigToast } from '../components/multisig-toast';
import { multisigPaths } from '../multisig.constants';
import { useMultisigActions, useVaultTx } from '../store/use-multisig';
import { SignerRollcall } from './components/signer-rollcall';
import { TxDetailsTable } from './components/tx-details-table';

const VERIFY_MS = 900;

function SectionLabel({ children }: { children: string }) {
  return (
    <styled.h3 textStyle="label.02" color="ink.text-subdued" mb="space.03" mt="space.05">
      {children}
    </styled.h3>
  );
}

function TxAlert({
  tone,
  title,
  body,
}: {
  tone: 'error' | 'info' | 'muted';
  title: string;
  body: string;
}) {
  const toneStyles = {
    error: { bg: 'red.background-primary', border: 'red.border', color: 'red.text-primary' },
    info: { bg: 'blue.background-primary', border: 'blue.border', color: 'blue.text-primary' },
    muted: {
      bg: 'ink.background-secondary',
      border: 'ink.border-default',
      color: 'ink.text-primary',
    },
  }[tone];
  return (
    <Box
      mb="space.04"
      p="space.04"
      borderRadius="md"
      bg={toneStyles.bg}
      borderWidth="1px"
      borderStyle="solid"
      borderColor={toneStyles.border}
    >
      <styled.div textStyle="label.02" color={toneStyles.color}>
        {title}
      </styled.div>
      <styled.div textStyle="caption.01" color="ink.text-subdued" mt="space.01">
        {body}
      </styled.div>
    </Box>
  );
}

export function TxDetailPage() {
  const { vaultId, txId } = useParams();
  const { vault, tx } = useVaultTx(vaultId, txId);
  const { signTransaction, broadcastTransaction, cancelTransaction } = useMultisigActions();
  const { showToast } = useMultisigToast();
  const [verifying, setVerifying] = useState(false);

  if (!vault || !tx) {
    return (
      <Page>
        <Page.Header
          title="Transaction"
          backTo={vault ? multisigPaths.vault(vault.id) : multisigPaths.index}
        />
        <MultisigErrorState body="This transaction isn't part of the current session." />
      </Page>
    );
  }

  function onSign() {
    setVerifying(true);
    // Simulate the non-bypassable verification gate before signing.
    setTimeout(() => {
      signTransaction({ vaultId: vault.id, txId: tx.id, signer: 'Me' });
      setVerifying(false);
      showToast('Signature added');
    }, VERIFY_MS);
  }
  function onBroadcast() {
    broadcastTransaction(vault.id, tx.id);
    showToast('Broadcasting transaction');
  }
  function onCancel() {
    cancelTransaction(vault.id, tx.id);
    showToast('Transaction cancelled');
  }

  const showFailedAlert = tx.status === 'failed' || tx.status === 'dropped';

  return (
    <Page>
      <Page.Header title="Transaction details" backTo={multisigPaths.vault(vault.id)} />
      <Flex direction={['column', 'column', 'row']} gap="space.06" alignItems="flex-start">
        <Box flex={['1', '1', '1.6']} width="100%">
          <MultisigHero
            themeId={vault.theme}
            primary="Transfer"
            secondary={
              <Flex alignItems="center" gap="space.02">
                <span>
                  Proposed {tx.proposedAt} by {tx.proposerName}
                </span>
                <AvatarCircle name={tx.proposerName} size="xs" />
              </Flex>
            }
          />
          {showFailedAlert && (
            <TxAlert
              tone="error"
              title={tx.status === 'dropped' ? 'Dropped from the mempool' : 'Failed to broadcast'}
              body="The network refused this transaction. Cancel it and propose a fresh one."
            />
          )}
          {tx.status === 'broadcast' && (
            <TxAlert
              tone="info"
              title="Submitted to network"
              body="Waiting for confirmation on the network explorer."
            />
          )}
          {tx.status === 'cancelled' && (
            <TxAlert
              tone="muted"
              title="Transaction cancelled"
              body="Collected signatures were discarded. This cannot be undone."
            />
          )}
          <SectionLabel>Transaction details</SectionLabel>
          <TxDetailsTable vault={vault} tx={tx} />
        </Box>
        <Box flex={['1', '1', '1']} width="100%">
          <SectionLabel>Signatures</SectionLabel>
          <SignerRollcall
            vault={vault}
            tx={tx}
            verifying={verifying}
            onSign={onSign}
            onBroadcast={onBroadcast}
            onCancel={onCancel}
          />
        </Box>
      </Flex>
    </Page>
  );
}
