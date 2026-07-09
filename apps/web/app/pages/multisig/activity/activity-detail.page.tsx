import { useLocation, useNavigate, useParams } from 'react-router';

import { useQuery } from '@tanstack/react-query';
import { Box, Flex, styled } from 'leather-styles/jsx';
import { useMultisigNetworks } from '~/features/multisig/auth/use-multisig-networks';
import { getMultisigAccountAddresses } from '~/features/multisig/vaults/multisig-account-addresses';
import { useVaultAccount } from '~/features/multisig/vaults/use-vault-accounts';
import { useVault, useVaults } from '~/features/multisig/vaults/use-vaults';
import { useUserSettings } from '~/hooks/use-user-settings';
import { createBlockchainActivityByTxIdDetailQuery } from '~/queries/activity/blockchain-activity.query';
import { formatCurrency } from '~/utils/currency-formatter';

import {
  type BlockchainActivityView,
  addOperator,
  getBitcoinExplorerLink,
  getStacksExplorerLink,
} from '@leather.io/features';
import type {
  AuthNetworkId,
  NetworkConfiguration,
  OnChainActivityStatus,
} from '@leather.io/models';
import { truncateMiddle } from '@leather.io/utils';

import { Badge, type BadgeVariant } from '../components/badge';
import { MultisigErrorState } from '../components/multisig-error-state';
import { MultisigHero } from '../components/multisig-hero';
import { MultisigPage } from '../components/multisig-page';
import { SectionLabel } from '../components/section-label';
import { vaultThemeFromName } from '../multisig-tokens';
import { multisigPaths } from '../multisig.constants';
import { formatRelativeTime } from '../tx/relative-time';

const onChainStatusBadge: Record<OnChainActivityStatus, { label: string; variant: BadgeVariant }> =
  {
    success: { label: 'Confirmed', variant: 'success' },
    pending: { label: 'Pending', variant: 'pending' },
    failed: { label: 'Failed', variant: 'error' },
  };

function explorerLink(view: BlockchainActivityView, network: NetworkConfiguration): string | null {
  if (view.chain === 'bitcoin') {
    return getBitcoinExplorerLink({
      networkPreference: network.chain.bitcoin.bitcoinNetwork,
      id: view.txid,
      type: 'tx',
    });
  }
  return getStacksExplorerLink({
    mode: network.chain.bitcoin.mode,
    type: 'txid',
    value: view.txid,
  });
}

function resolveQuoteColor(view: BlockchainActivityView) {
  if (view.status !== 'success') return 'ink.text-subdued';
  if (view.amount?.direction === 'received') return 'green.action-primary-default';
  return 'ink.text-primary';
}

interface DetailRowProps {
  label: string;
  value: string;
}

function DetailRow({ label, value }: DetailRowProps) {
  return (
    <Flex justifyContent="space-between" gap="space.04">
      <styled.span textStyle="label.02" color="ink.text-subdued">
        {label}
      </styled.span>
      <styled.span textStyle="label.02" color="ink.text-primary">
        {value}
      </styled.span>
    </Flex>
  );
}

export function ActivityDetailPage() {
  const { vaultId, accountId, txid } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const canGoBack = location.key !== 'default';
  const settings = useUserSettings();

  const { btc: btcNetwork, stx: stxNetwork } = useMultisigNetworks();
  const btcVaults = useVaults(btcNetwork);
  const stxVaults = useVaults(stxNetwork);
  const inBtc = btcVaults.data?.some(summary => summary.id === vaultId) ?? false;
  const inStx = stxVaults.data?.some(summary => summary.id === vaultId) ?? false;
  const vaultNetworkKnown = inBtc || inStx;
  const network: AuthNetworkId = inStx ? stxNetwork : btcNetwork;

  const vault = useVault(network, vaultNetworkKnown ? vaultId : undefined);
  const account = useVaultAccount(network, vaultNetworkKnown ? accountId : undefined);
  const accountAddresses = getMultisigAccountAddresses(account.data);

  const activity = useQuery({
    ...createBlockchainActivityByTxIdDetailQuery(accountAddresses, txid ?? '', settings),
    enabled: Boolean(account.data && txid),
  });

  const backTo =
    vaultId && accountId ? multisigPaths.account(vaultId, accountId) : multisigPaths.index;
  const onBack = canGoBack ? () => navigate(-1) : undefined;

  const listsLoading = btcVaults.isLoading || stxVaults.isLoading;
  const detailLoading = account.isLoading || vault.isLoading || activity.isLoading;
  const isResolving = vaultNetworkKnown ? detailLoading : listsLoading;

  const detail = activity.data ?? undefined;

  if (!detail) {
    return (
      <MultisigPage title="Activity" backTo={backTo} onBack={onBack}>
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
          <MultisigErrorState body="No activity found for this transaction." />
        )}
      </MultisigPage>
    );
  }

  const { view, activity: onchain } = detail;
  const status = onChainStatusBadge[view.status];
  const link = explorerLink(view, settings.network);
  const amount = view.amount;
  const counterpartyLabel = onchain.initiatedByUser ? 'To' : 'From';

  return (
    <MultisigPage title="Activity" backTo={backTo} onBack={onBack}>
      <MultisigHero
        variant="balance"
        themeId={vaultThemeFromName(vault.data?.theme).id}
        primary={view.title || '—'}
        secondary={view.subtitle || formatRelativeTime(new Date(view.timestamp * 1000))}
      >
        <Box mt="space.03">
          <Badge variant={status.variant} label={status.label} />
        </Box>
      </MultisigHero>

      {amount ? (
        <>
          <SectionLabel>Amount</SectionLabel>
          <Flex direction="column" gap="space.01" mb="space.05">
            <styled.span textStyle="heading.04" color={resolveQuoteColor(view)}>
              {addOperator(
                formatCurrency(amount.quote),
                amount.direction === 'received' ? '+' : '−'
              )}
            </styled.span>
            {amount.crypto ? (
              <styled.span textStyle="label.02" color="ink.text-subdued">
                {formatCurrency(amount.crypto)}
              </styled.span>
            ) : null}
          </Flex>
        </>
      ) : null}

      <SectionLabel>Details</SectionLabel>
      <Flex direction="column" gap="space.03">
        {onchain.counterparty ? (
          <DetailRow label={counterpartyLabel} value={truncateMiddle(onchain.counterparty)} />
        ) : null}
        {onchain.fee ? <DetailRow label="Network fee" value={formatCurrency(onchain.fee)} /> : null}
        <DetailRow label="Transaction ID" value={truncateMiddle(view.txid)} />
        <DetailRow label="Date" value={formatRelativeTime(new Date(view.timestamp * 1000))} />
        {link ? (
          <styled.a
            href={link}
            target="_blank"
            rel="noopener noreferrer"
            textStyle="label.02"
            color="blue.action-primary-default"
          >
            View in explorer
          </styled.a>
        ) : null}
      </Flex>
    </MultisigPage>
  );
}
