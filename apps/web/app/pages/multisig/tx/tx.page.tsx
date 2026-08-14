import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';

import { useQuery } from '@tanstack/react-query';
import { Box, Flex } from 'leather-styles/jsx';
import { useMultisigNetworks } from '~/features/multisig/auth/use-multisig-networks';
import { useSession } from '~/features/multisig/auth/use-session';
import { useIsRestoringSession } from '~/features/multisig/auth/use-session-bootstrap';
import { getActivityActionLine } from '~/features/multisig/activity/activity-action-line';
import {
  decodeProposalSummary,
  matchesProposalTokenAsset,
} from '~/features/multisig/transactions/decode-proposal-summary';
import { useContractProtocol } from '~/features/multisig/transactions/use-contract-protocol';
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
import { useUserSettings } from '~/hooks/use-user-settings';
import { useMarketDataQuery } from '~/queries/market-data/market-data.query';

import { btcAsset, stxAsset } from '@leather.io/constants';
import {
  buildBlockchainActivityActionTitle,
  interpolateActivityTemplate,
} from '@leather.io/features';
import type {
  AuthNetworkId,
  MarketData,
  Money,
  MultisigTransaction,
  MultisigTransactionStatus,
  StacksProtocolAction,
  VaultAccount,
} from '@leather.io/models';
import {
  createMarketDataQueryConfig,
  createSip10AssetByPrincipalQueryConfig,
} from '@leather.io/queries';
import { BlockchainActivityAvatarIcon, BlockchainActivityIndicatorIcon } from '@leather.io/ui';
import { baseCurrencyAmountInQuote, createMoney, truncateMiddle } from '@leather.io/utils';

import { AvatarCircle } from '../components/avatar-circle';
import { MultisigErrorState } from '../components/multisig-error-state';
import { MultisigHero } from '../components/multisig-hero';
import { MultisigPage } from '../components/multisig-page';
import { SectionLabel } from '../components/section-label';
import { vaultThemeFromName } from '../multisig-tokens';
import { multisigPaths } from '../multisig.constants';
import { SignerRollcall } from './components/signer-rollcall';
import { TxDetailsTable } from './components/tx-details-table';
import { formatTransactionActionError } from './format-transaction-error';
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
  functionName: string | undefined,
  action: StacksProtocolAction | undefined,
  tokenSymbol: string | undefined
): string {
  if (kind === 'contractDeploy') return 'Contract deploy';
  if (kind !== 'contractCall') return tokenSymbol ? `Send ${tokenSymbol}` : 'Transfer';
  const actionTitle =
    action !== undefined && action !== 'contract-execution'
      ? buildBlockchainActivityActionTitle(action, interpolateActivityTemplate)
      : '';
  return actionTitle || functionName || 'Contract call';
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
  const onChain = useOnChainTransaction(network, transaction.data?.txId ?? null, account.data);
  const marketData = useMarketDataQuery(network.startsWith('btc') ? btcAsset : stxAsset);

  // On-chain values are authoritative once broadcast; before that, decode the
  // proposal payload so recipient/amount/fee still show while collecting signatures.
  const decoded =
    transaction.data && account.data
      ? decodeProposalSummary(account.data, transaction.data)
      : undefined;
  const protocol = useContractProtocol(decoded?.contractId);
  const tokenAsset = useQuery({
    ...createSip10AssetByPrincipalQueryConfig(decoded?.token?.contractId ?? '', settings),
    enabled: Boolean(decoded?.token),
  });
  const verifiedTokenAsset =
    decoded?.token &&
    tokenAsset.data &&
    matchesProposalTokenAsset(tokenAsset.data, decoded.token.assetName)
      ? tokenAsset.data
      : undefined;
  const tokenMarketData = useQuery({
    ...createMarketDataQueryConfig(verifiedTokenAsset ?? stxAsset, settings),
    enabled: Boolean(verifiedTokenAsset),
  });

  const isContractProposal = decoded?.kind === 'contractCall' || decoded?.kind === 'contractDeploy';

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
  const enrichmentLoading = [onChain, marketData, tokenAsset, tokenMarketData, protocol, me].some(
    query => query.isLoading
  );
  const isResolving =
    !hydrated || sessionsRestoring || !listsSettled || detailResolving || enrichmentLoading;

  if (isResolving || !vault.data || !transaction.data || !account.data) {
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

  const tokenAmount =
    decoded?.token && verifiedTokenAsset
      ? createMoney(
          decoded.token.baseUnitAmount,
          verifiedTokenAsset.symbol,
          verifiedTokenAsset.decimals
        )
      : undefined;
  const recipient = onChain.recipient ?? decoded?.recipient;
  const amount = onChain.amount ?? decoded?.amount ?? tokenAmount;
  const fee = onChain.fee ?? decoded?.fee;
  const amountFiat = toFiat(amount, marketData.data) ?? toFiat(amount, tokenMarketData.data);
  const feeFiat = toFiat(fee, marketData.data);
  const contractDetail = isContractProposal ? onChain.detail : undefined;
  const heroTitle = proposalHeroTitle(
    decoded?.kind,
    decoded?.functionName,
    contractDetail?.activity.action,
    verifiedTokenAsset?.symbol
  );
  const contractActionLine = contractDetail ? getActivityActionLine(contractDetail.view) : undefined;
  const heroSubtitle = contractActionLine
    ? contractActionLine.viaProtocol
    : contractDetail?.view.subtitle;
  const heroTimeline = tx.broadcastAt
    ? { verb: 'Broadcast', when: formatRelativeTime(new Date(tx.broadcastAt)) }
    : { verb: 'Proposed', when: initiationDate };
  const effectiveStatus = reconcileStatus(tx.status, onChain.status);

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
        <Box flex={['1', '1', '1.6']} width="100%">
          <MultisigHero
            variant="balance"
            themeId={vaultThemeFromName(vault.data.theme).id}
            media={
              contractDetail ? (
                <BlockchainActivityAvatarIcon
                  size={48}
                  avatar={contractDetail.view.avatar}
                  indicator={
                    <BlockchainActivityIndicatorIcon
                      indicator={contractDetail.view.indicator}
                      size={16}
                    />
                  }
                />
              ) : undefined
            }
            primary={heroTitle}
            secondary={
              <Flex direction="column" gap="space.01">
                {heroSubtitle ? <span>{heroSubtitle}</span> : null}
                <Flex alignItems="center" gap="space.02">
                  <span>
                    {heroTimeline.verb} {heroTimeline.when} by {proposerName}
                  </span>
                  <AvatarCircle name={proposerName} size="xs" />
                </Flex>
              </Flex>
            }
          />
          <SectionLabel>Transaction details</SectionLabel>
          <TxDetailsTable
            transaction={tx}
            status={effectiveStatus}
            vaultLink={{ name: vault.data.name, to: multisigPaths.vault(vault.data.id) }}
            accountLink={{
              name: acct.name,
              to: multisigPaths.account(vault.data.id, acct.id),
            }}
            proposerLabel={proposerLabel}
            initiationDate={initiationDate}
            recipient={recipient}
            amount={amount}
            amountFiat={amountFiat}
            fee={fee}
            feeFiat={feeFiat}
            contractId={
              decoded?.token && !verifiedTokenAsset && !tokenAsset.isPending
                ? decoded.token.contractId
                : decoded?.contractId
            }
            functionName={decoded?.functionName}
            protocolName={protocol.name}
            balanceChanges={contractDetail?.activity.balanceChanges}
            nonce={onChain.nonce ?? tx.nonce}
            memo={decoded?.memo}
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
