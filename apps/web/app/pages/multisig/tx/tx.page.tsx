import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';

import { Box, Flex } from 'leather-styles/jsx';
import { useProposalActivityItem } from '~/features/multisig/activity/use-proposal-activity-item';
import { useMultisigNetworks } from '~/features/multisig/auth/use-multisig-networks';
import { useSession } from '~/features/multisig/auth/use-session';
import { useIsRestoringSession } from '~/features/multisig/auth/use-session-bootstrap';
import {
  useBroadcastTransaction,
  useCancelTransaction,
  useSignTransaction,
} from '~/features/multisig/transactions/use-transaction-mutations';
import { getMultisigAccountAddresses } from '~/features/multisig/vaults/multisig-account-addresses';
import { useMultisigMe } from '~/features/multisig/vaults/use-multisig-me';
import { useVaultAccount } from '~/features/multisig/vaults/use-vault-accounts';
import { useMultisigTransaction } from '~/features/multisig/vaults/use-vault-transactions';
import { useVault, useVaults } from '~/features/multisig/vaults/use-vaults';
import { useToast } from '~/features/toasts/use-toast';
import { useUserSettings } from '~/hooks/use-user-settings';
import { useBlockchainActivityByTxIdDetailQuery } from '~/queries/activity/blockchain-activity.query';
import { useMarketDataQuery } from '~/queries/market-data/market-data.query';

import { btcAsset, stxAsset } from '@leather.io/constants';
import type {
  AuthNetworkId,
  MultisigTransaction,
  MultisigTransactionStatus,
  OnChainActivityStatus,
  VaultAccount,
} from '@leather.io/models';
import { truncateMiddle } from '@leather.io/utils';

import { AvatarCircle } from '../components/avatar-circle';
import { toFiat } from '../components/detail-table';
import { MultisigErrorState } from '../components/multisig-error-state';
import { MultisigPage } from '../components/multisig-page';
import { SectionLabel } from '../components/section-label';
import { VaultActivityDetail } from '../components/vault-activity-detail';
import { vaultThemeFromName } from '../multisig-tokens';
import { multisigPaths } from '../multisig.constants';
import { SignerRollcall } from './components/signer-rollcall';
import { formatTransactionActionError } from './format-transaction-error';
import { formatRelativeDateTime, formatRelativeTime } from './relative-time';

// The chain is the source of truth once a tx is on it: a confirmed/failed
// on-chain result supersedes the backend's "broadcast" status.
function reconcileStatus(
  backendStatus: MultisigTransactionStatus,
  onChainStatus: OnChainActivityStatus | undefined
): MultisigTransactionStatus {
  if (onChainStatus === 'success') return 'confirmed';
  if (onChainStatus === 'failed') return 'failed';
  return backendStatus;
}

function isAwaitingSignatureFrom(
  transaction: MultisigTransaction,
  account: VaultAccount,
  address: string | undefined
) {
  const signer = account.signers.find(s => s.address === address);
  if (!signer) return false;
  const signed = transaction.signatures.some(sig => sig.signerIndex === signer.signerIndex);
  return transaction.status === 'pending' && !signed;
}

function readAutoSign(state: unknown): boolean {
  return (
    typeof state === 'object' && state !== null && 'autoSign' in state && state.autoSign === true
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
  const [autoSignStarted, setAutoSignStarted] = useState(false);
  useEffect(() => setHydrated(true), []);

  const settings = useUserSettings();
  const { btc: btcNetwork, stx: stxNetwork } = useMultisigNetworks();
  const btcVaults = useVaults(btcNetwork);
  const stxVaults = useVaults(stxNetwork);
  const inBtc = btcVaults.data?.some(summary => summary.id === vaultId) ?? false;
  const inStx = stxVaults.data?.some(summary => summary.id === vaultId) ?? false;
  const vaultNetworkKnown = inBtc || inStx;
  const network: AuthNetworkId = inStx ? stxNetwork : btcNetwork;

  const vault = useVault(network, vaultNetworkKnown ? vaultId : undefined);
  const transaction = useMultisigTransaction(network, vaultNetworkKnown ? txId : undefined);
  const account = useVaultAccount(network, transaction.data?.vaultAccountId);
  const me = useMultisigMe(vaultNetworkKnown ? network : undefined);
  const marketData = useMarketDataQuery(network.startsWith('btc') ? btcAsset : stxAsset);

  const onchainDetail = useBlockchainActivityByTxIdDetailQuery(
    getMultisigAccountAddresses(account.data),
    transaction.data?.txId ?? '',
    settings,
    Boolean(transaction.data?.txId && account.data)
  );
  const proposalActivity = useProposalActivityItem(transaction.data, account.data);

  const signTransaction = useSignTransaction(network);
  const cancelTransaction = useCancelTransaction(network);
  const broadcastTransaction = useBroadcastTransaction(network);
  const toast = useToast();

  useEffect(() => {
    if (autoSignStarted) return;
    if (!readAutoSign(location.state)) return;
    if (!transaction.data || !account.data) return;
    if (!isAwaitingSignatureFrom(transaction.data, account.data, me.data?.address)) return;
    setAutoSignStarted(true);
    void navigate(location.pathname, { replace: true, state: null });
    signTransaction.mutate(
      { transaction: transaction.data, account: account.data },
      {
        onSuccess: () => toast.success('Signature added'),
        onError: err => {
          const message = formatTransactionActionError(err);
          if (message) toast.error(message);
        },
      }
    );
  }, [
    autoSignStarted,
    location.state,
    location.pathname,
    transaction.data,
    account.data,
    me.data?.address,
    navigate,
    signTransaction,
    toast,
  ]);

  const btcSession = useSession(btcNetwork);
  const stxSession = useSession(stxNetwork);
  const restoringBtc = useIsRestoringSession(btcNetwork);
  const restoringStx = useIsRestoringSession(stxNetwork);

  const sessionsRestoring = restoringBtc || restoringStx;
  const listsSettled = (!btcSession || btcVaults.isSuccess) && (!stxSession || stxVaults.isSuccess);
  const detailResolving =
    vaultNetworkKnown && !(vault.isSuccess && transaction.isSuccess && account.isSuccess);
  const enrichmentLoading =
    [onchainDetail, marketData, me].some(query => query.isLoading) || proposalActivity.isLoading;
  const isResolving =
    !hydrated || sessionsRestoring || !listsSettled || detailResolving || enrichmentLoading;

  const item = onchainDetail.data ?? proposalActivity.item;

  if (isResolving || !vault.data || !transaction.data || !account.data || !item) {
    return (
      <MultisigPage
        title="Transaction details"
        backTo={vaultId ? multisigPaths.vault(vaultId) : multisigPaths.index}
      >
        {isResolving ? (
          <Flex direction="column" gap="space.03">
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
      </MultisigPage>
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

  const memo =
    proposalActivity.payload && 'memo' in proposalActivity.payload
      ? proposalActivity.payload.memo
      : undefined;
  const effectiveStatus = reconcileStatus(tx.status, onchainDetail.data?.activity.status);
  const feeFiat = toFiat(item.activity?.fee, marketData.data);
  const heroTimeline = tx.broadcastAt
    ? { verb: 'Broadcast', when: formatRelativeDateTime(new Date(tx.broadcastAt)) }
    : { verb: 'Proposed', when: formatRelativeDateTime(new Date(tx.proposalTimestamp * 1000)) };

  function showActionError(err: Error) {
    const message = formatTransactionActionError(err);
    if (message) toast.error(message);
  }
  function onSign() {
    signTransaction.mutate(
      { transaction: tx, account: acct },
      {
        onSuccess: () => toast.success('Signature added'),
        onError: showActionError,
      }
    );
  }
  function onCancel() {
    cancelTransaction.mutate(tx.id, {
      onSuccess: () => toast.success('Transaction cancelled'),
      onError: showActionError,
    });
  }
  function onBroadcast() {
    broadcastTransaction.mutate(tx.id, {
      onSuccess: () => toast.success('Broadcasting transaction'),
      onError: showActionError,
    });
  }

  return (
    <MultisigPage
      title="Transaction details"
      backTo={multisigPaths.account(vault.data.id, tx.vaultAccountId)}
      onBack={canGoBack ? () => navigate(-1) : undefined}
    >
      <Flex
        direction={['column', 'column', 'row']}
        gap={['space.06', 'space.06', 'space.08', 'space.10']}
        alignItems="flex-start"
      >
        <Box flex={['1', '1', '1.6']} width="100%" minWidth={0}>
          <VaultActivityDetail
            item={item}
            themeId={vaultThemeFromName(vault.data.theme).id}
            network={settings.network}
            vaultLink={{ name: vault.data.name, to: multisigPaths.vault(vault.data.id) }}
            accountLink={{
              name: acct.name,
              to: multisigPaths.account(vault.data.id, acct.id),
            }}
            feeFiat={feeFiat}
            caption={
              <Flex alignItems="center" gap="space.02">
                <span>
                  {heroTimeline.verb} {heroTimeline.when} by
                </span>
                <AvatarCircle name={proposerName} size="sm" />
                <span>{proposerName}</span>
              </Flex>
            }
            proposal={{
              status: effectiveStatus,
              txId: tx.txId,
              proposerLabel,
              initiationDate,
              broadcastDate: tx.broadcastAt
                ? formatRelativeTime(new Date(tx.broadcastAt))
                : undefined,
              memo,
            }}
          />
        </Box>
        <Box flex={['1', '1', '1']} width="100%" minWidth={0}>
          <SectionLabel noGutter>Signatures</SectionLabel>
          <SignerRollcall
            vault={vault.data}
            account={acct}
            transaction={tx}
            currentUserAddress={me.data?.address}
            currentUserId={me.data?.id}
            isSigning={signTransaction.isPending}
            isCancelling={cancelTransaction.isPending}
            isBroadcasting={broadcastTransaction.isPending}
            onSign={onSign}
            onCancel={onCancel}
            onBroadcast={onBroadcast}
          />
        </Box>
      </Flex>
    </MultisigPage>
  );
}
