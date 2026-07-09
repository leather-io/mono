import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';

import { Box, Flex } from 'leather-styles/jsx';
import { useMultisigNetworks } from '~/features/multisig/auth/use-multisig-networks';
import { useSession } from '~/features/multisig/auth/use-session';
import { useIsRestoringSession } from '~/features/multisig/auth/use-session-bootstrap';
import { decodeProposalSummary } from '~/features/multisig/transactions/decode-proposal-summary';
import { useContractProtocolName } from '~/features/multisig/transactions/use-contract-protocol';
import { useOnChainTransaction } from '~/features/multisig/transactions/use-onchain-transaction';
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
import { useMarketDataQuery } from '~/queries/market-data/market-data.query';

import { btcAsset, stxAsset } from '@leather.io/constants';
import type {
  AuthNetworkId,
  MarketData,
  Money,
  MultisigTransaction,
  MultisigTransactionStatus,
  VaultAccount,
} from '@leather.io/models';
import { baseCurrencyAmountInQuote, truncateMiddle } from '@leather.io/utils';

import { AvatarCircle } from '../components/avatar-circle';
import { Badge } from '../components/badge';
import { MultisigErrorState } from '../components/multisig-error-state';
import { MultisigHero } from '../components/multisig-hero';
import { MultisigPage } from '../components/multisig-page';
import { SectionLabel } from '../components/section-label';
import { transactionStatusBadge } from '../components/transaction-status';
import { vaultThemeFromName } from '../multisig-tokens';
import { multisigPaths } from '../multisig.constants';
import { SignerRollcall } from './components/signer-rollcall';
import { TxDetailsTable } from './components/tx-details-table';
import { formatRelativeTime } from './relative-time';

// The chain is the source of truth once a tx is on it: a confirmed/failed
// on-chain result supersedes the backend's "broadcast" status.
function reconcileStatus(
  backendStatus: MultisigTransactionStatus,
  onChainStatus: 'confirmed' | 'pending' | 'failed' | undefined
): MultisigTransactionStatus {
  if (onChainStatus === 'confirmed') return 'confirmed';
  if (onChainStatus === 'failed') return 'failed';
  return backendStatus;
}

function toFiat(money: Money | undefined, marketData: MarketData | undefined): Money | undefined {
  if (!money || !marketData || money.symbol !== marketData.pair.base) return undefined;
  return baseCurrencyAmountInQuote(money, marketData);
}

function proposalHeroTitle(
  kind: 'transfer' | 'contractCall' | 'contractDeploy' | undefined,
  functionName: string | undefined
): string {
  if (kind === 'contractCall') return functionName ?? 'Contract call';
  if (kind === 'contractDeploy') return 'Contract deploy';
  return 'Transfer';
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
  const onChain = useOnChainTransaction(
    network,
    transaction.data?.txId ?? null,
    account.data?.multisigAddress ?? ''
  );
  const marketData = useMarketDataQuery(network.startsWith('btc') ? btcAsset : stxAsset);

  // On-chain values are authoritative once broadcast; before that, decode the
  // proposal payload so recipient/amount/fee still show while collecting signatures.
  const decoded =
    transaction.data && account.data
      ? decodeProposalSummary(account.data, transaction.data)
      : undefined;
  const protocolName = useContractProtocolName(decoded?.contractId);

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
      { onSuccess: () => toast.success('Signature added') }
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
  const isResolving = !hydrated || sessionsRestoring || !listsSettled || detailResolving;

  if (!vault.data || !transaction.data || !account.data) {
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

  const recipient = onChain.recipient ?? decoded?.recipient;
  const amount = onChain.amount ?? decoded?.amount;
  const fee = onChain.fee ?? decoded?.fee;
  const amountFiat = toFiat(amount, marketData.data);
  const feeFiat = toFiat(fee, marketData.data);
  const heroTitle = proposalHeroTitle(decoded?.kind, decoded?.functionName);
  const effectiveStatus = reconcileStatus(tx.status, onChain.status);
  const awaitingMySignature = isAwaitingSignatureFrom(tx, acct, me.data?.address);
  const heroStatus = awaitingMySignature
    ? { label: 'Awaiting your signature', variant: 'pending' as const }
    : transactionStatusBadge(effectiveStatus);

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
        <Box flex={['1', '1', '1.6']} width="100%">
          <MultisigHero
            variant="balance"
            themeId={vaultThemeFromName(vault.data.theme).id}
            primary={heroTitle}
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
            status={effectiveStatus}
            proposerLabel={proposerLabel}
            initiationDate={initiationDate}
            recipient={recipient}
            amount={amount}
            amountFiat={amountFiat}
            fee={fee}
            feeFiat={feeFiat}
            contractId={decoded?.contractId}
            functionName={decoded?.functionName}
            protocolName={protocolName}
          />
        </Box>
        <Box flex={['1', '1', '1']} width="100%">
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
    </MultisigPage>
  );
}
