import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';

import { Box, Flex, styled } from 'leather-styles/jsx';
import { useSession } from '~/features/multisig/auth/use-session';
import { useIsRestoringSession } from '~/features/multisig/auth/use-session-bootstrap';
import {
  useBroadcastTransaction,
  useCancelTransaction,
  useSignTransaction,
} from '~/features/multisig/transactions/use-transaction-mutations';
import { useMultisigMe } from '~/features/multisig/vaults/use-multisig-me';
import { useVaultAccount } from '~/features/multisig/vaults/use-vault-accounts';
import { useMultisigTransaction } from '~/features/multisig/vaults/use-vault-transactions';
import { useVault, useVaults } from '~/features/multisig/vaults/use-vaults';
import { useToast } from '~/features/toasts/use-toast';
import { Page } from '~/layouts/page/page';

import type { AuthNetworkId } from '@leather.io/models';
import { truncateMiddle } from '@leather.io/utils';

import { AvatarCircle } from '../components/avatar-circle';
import { Badge } from '../components/badge';
import { MultisigErrorState } from '../components/multisig-error-state';
import { MultisigHero } from '../components/multisig-hero';
import { transactionStatusBadge } from '../components/transaction-status';
import { vaultThemeFromName } from '../multisig-tokens';
import { multisigPaths } from '../multisig.constants';
import { SignerRollcall } from './components/signer-rollcall';
import { TxDetailsTable } from './components/tx-details-table';
import { formatRelativeTime } from './relative-time';

function SectionLabel({ children }: { children: string }) {
  return (
    <styled.h3 textStyle="label.02" color="ink.text-subdued" mb="space.03" mt="space.05">
      {children}
    </styled.h3>
  );
}

export function TxDetailPage() {
  const { vaultId, txId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  // location.key is 'default' only when this is the first entry in the session's
  // history (deep link / refresh), where there is nowhere to go back to.
  const canGoBack = location.key !== 'default';
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);

  const btcVaults = useVaults('btc:mainnet');
  const stxVaults = useVaults('stx:mainnet');
  const inBtc = btcVaults.data?.some(summary => summary.id === vaultId) ?? false;
  const inStx = stxVaults.data?.some(summary => summary.id === vaultId) ?? false;
  const vaultNetworkKnown = inBtc || inStx;
  const network: AuthNetworkId = inStx ? 'stx:mainnet' : 'btc:mainnet';

  const vault = useVault(network, vaultNetworkKnown ? vaultId : undefined);
  const transaction = useMultisigTransaction(network, vaultNetworkKnown ? txId : undefined);
  const account = useVaultAccount(network, transaction.data?.vaultAccountId);
  const me = useMultisigMe(vaultNetworkKnown ? network : undefined);

  const signTransaction = useSignTransaction(network);
  const cancelTransaction = useCancelTransaction(network);
  const broadcastTransaction = useBroadcastTransaction(network);
  const toast = useToast();

  const btcSession = useSession('btc:mainnet');
  const stxSession = useSession('stx:mainnet');
  const restoringBtc = useIsRestoringSession('btc:mainnet');
  const restoringStx = useIsRestoringSession('stx:mainnet');
  const sessionsRestoring = restoringBtc || restoringStx;
  const listsSettled = (!btcSession || btcVaults.isSuccess) && (!stxSession || stxVaults.isSuccess);
  const detailResolving =
    vaultNetworkKnown && !(vault.isSuccess && transaction.isSuccess && account.isSuccess);
  const isResolving = !hydrated || sessionsRestoring || !listsSettled || detailResolving;

  if (!vault.data || !transaction.data || !account.data) {
    return (
      <Page>
        <Page.Header
          title="Transaction details"
          backTo={vaultId ? multisigPaths.vault(vaultId) : multisigPaths.index}
        />
        {isResolving ? (
          <Flex direction="column" gap="space.03" mt="space.05">
            {[0, 1, 2].map(index => (
              <Box
                key={index}
                height="64px"
                borderRadius="md"
                bg="ink.component-background-default"
                opacity={0.6}
              />
            ))}
          </Flex>
        ) : (
          <MultisigErrorState body="No transaction found. It may not exist, or you may not be a member." />
        )}
      </Page>
    );
  }

  const tx = transaction.data;
  const acct = account.data;

  const proposer = vault.data.members.find(member => member.user?.id === tx.proposerUserId);
  const isMine = tx.proposerUserId === me.data?.id;
  const proposerName = isMine
    ? 'Me'
    : proposer?.name || (proposer ? truncateMiddle(proposer.address) : 'Unknown');
  const proposerLabel = `${proposerName}${isMine ? ' (you)' : ''}`;
  const initiationDate = formatRelativeTime(new Date(tx.proposalTimestamp * 1000));

  const mySigner = acct.signers.find(signer => signer.address === me.data?.address);
  const iSigned = mySigner
    ? tx.signatures.some(sig => sig.signerIndex === mySigner.signerIndex)
    : false;
  const awaitingMySignature = tx.status === 'pending' && Boolean(mySigner) && !iSigned;
  const heroStatus = awaitingMySignature
    ? { label: 'Awaiting your signature', variant: 'pending' as const }
    : transactionStatusBadge(tx.status);

  function onSign() {
    signTransaction.mutate(
      { transaction: tx, account: acct },
      {
        onSuccess: () => toast.success('Signature added'),
        onError: err => toast.error(err.message),
      }
    );
  }
  function onCancel() {
    cancelTransaction.mutate(tx.id, {
      onSuccess: () => toast.success('Transaction cancelled'),
      onError: err => toast.error(err.message),
    });
  }
  function onBroadcast() {
    broadcastTransaction.mutate(tx.id, {
      onSuccess: () => toast.success('Broadcasting transaction'),
      onError: err => toast.error(err.message),
    });
  }

  return (
    <Page>
      <Page.Header
        title="Transaction details"
        backTo={multisigPaths.account(vault.data.id, tx.vaultAccountId)}
        onBack={canGoBack ? () => navigate(-1) : undefined}
      />
      <Flex
        direction={{ base: 'column', xl: 'row' }}
        gap="space.06"
        alignItems="flex-start"
        mt="space.07"
      >
        <Box flex={{ xl: '1' }} minWidth={0} width={{ base: '100%', xl: 'auto' }}>
          <MultisigHero
            themeId={vaultThemeFromName(vault.data.theme).id}
            primary="Transfer"
            secondary={
              <Flex alignItems="center" gap="space.02">
                <span>
                  Proposed {initiationDate} by {proposerName}
                </span>
                <AvatarCircle name={proposerName} size="xs" />
              </Flex>
            }
          >
            <Box mt="space.03">
              <Badge variant={heroStatus.variant} label={heroStatus.label} />
            </Box>
          </MultisigHero>
          <SectionLabel>Transaction details</SectionLabel>
          <TxDetailsTable
            transaction={tx}
            proposerLabel={proposerLabel}
            initiationDate={initiationDate}
          />
        </Box>
        <Box width={{ base: '100%', xl: '420px' }} flexShrink={0}>
          <SectionLabel>Signatures</SectionLabel>
          <SignerRollcall
            vault={vault.data}
            account={acct}
            transaction={tx}
            currentUserAddress={me.data?.address}
            isSigning={signTransaction.isPending}
            isCancelling={cancelTransaction.isPending}
            isBroadcasting={broadcastTransaction.isPending}
            onSign={onSign}
            onCancel={onCancel}
            onBroadcast={onBroadcast}
          />
        </Box>
      </Flex>
    </Page>
  );
}
