import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';

import { useQuery } from '@tanstack/react-query';
import { Box, Flex } from 'leather-styles/jsx';
import { CopyAddress } from '~/components/copy-address';
import { ExternalLink } from '~/components/external-link';
import { useMultisigNetworks } from '~/features/multisig/auth/use-multisig-networks';
import { useSession } from '~/features/multisig/auth/use-session';
import { useIsRestoringSession } from '~/features/multisig/auth/use-session-bootstrap';
import { getMultisigAccountAddresses } from '~/features/multisig/vaults/multisig-account-addresses';
import { useVaultAccount } from '~/features/multisig/vaults/use-vault-accounts';
import { useVault, useVaults } from '~/features/multisig/vaults/use-vaults';
import { useUserSettings } from '~/hooks/use-user-settings';
import { createBlockchainActivityByTxIdDetailQuery } from '~/queries/activity/blockchain-activity.query';
import { useMarketDataQuery } from '~/queries/market-data/market-data.query';

import { btcAsset, stxAsset } from '@leather.io/constants';
import {
  type BlockchainActivityView,
  getBitcoinExplorerLink,
  getStacksExplorerLink,
} from '@leather.io/features';
import type {
  AuthNetworkId,
  MarketData,
  Money,
  NetworkConfiguration,
  OnChainActivityStatus,
} from '@leather.io/models';
import { baseCurrencyAmountInQuote } from '@leather.io/utils';

import { type BadgeVariant } from '../components/badge';
import {
  DetailLocationRow,
  DetailRow,
  DetailStatusRow,
  DetailTable,
  balanceChangeValue,
  moneyWithFiat,
  pendingValue,
} from '../components/detail-table';
import { MultisigErrorState } from '../components/multisig-error-state';
import { MultisigHero } from '../components/multisig-hero';
import { MultisigPage } from '../components/multisig-page';
import { SectionLabel } from '../components/section-label';
import { vaultThemeFromName } from '../multisig-tokens';
import { multisigPaths } from '../multisig.constants';
import { formatRelativeTime } from '../tx/relative-time';

const onChainStatusDisplay: Record<
  OnChainActivityStatus,
  { label: string; variant: BadgeVariant }
> = {
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

function toFiat(money: Money | undefined, marketData: MarketData | undefined): Money | undefined {
  if (!money || !marketData || money.symbol !== marketData.pair.base) return undefined;
  return baseCurrencyAmountInQuote(money, marketData);
}

export function ActivityDetailPage() {
  const { vaultId, accountId, txid } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const canGoBack = location.key !== 'default';
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => setHydrated(true), []);
  const settings = useUserSettings();

  const { btc: btcNetwork, stx: stxNetwork } = useMultisigNetworks();
  const btcVaults = useVaults(btcNetwork);
  const stxVaults = useVaults(stxNetwork);
  const btcSession = useSession(btcNetwork);
  const stxSession = useSession(stxNetwork);
  const restoringBtc = useIsRestoringSession(btcNetwork);
  const restoringStx = useIsRestoringSession(stxNetwork);
  const inBtc = btcVaults.data?.some(summary => summary.id === vaultId) ?? false;
  const inStx = stxVaults.data?.some(summary => summary.id === vaultId) ?? false;
  const vaultNetworkKnown = inBtc || inStx;
  const network: AuthNetworkId = inStx ? stxNetwork : btcNetwork;

  const vault = useVault(network, vaultNetworkKnown ? vaultId : undefined);
  const account = useVaultAccount(network, vaultNetworkKnown ? accountId : undefined);
  const accountAddresses = getMultisigAccountAddresses(account.data);
  const marketData = useMarketDataQuery(network.startsWith('btc') ? btcAsset : stxAsset);

  const activityEnabled = Boolean(account.data && txid);
  const activity = useQuery({
    ...createBlockchainActivityByTxIdDetailQuery(accountAddresses, txid ?? '', settings),
    enabled: activityEnabled,
  });

  const backTo =
    vaultId && accountId ? multisigPaths.account(vaultId, accountId) : multisigPaths.index;
  const onBack = canGoBack ? () => navigate(-1) : undefined;

  const sessionsRestoring = restoringBtc || restoringStx;
  const listsSettled = (!btcSession || btcVaults.isSuccess) && (!stxSession || stxVaults.isSuccess);
  const detailResolving =
    vaultNetworkKnown && !(vault.isSuccess && account.isSuccess && activity.isSuccess);
  const isResolving = !hydrated || sessionsRestoring || !listsSettled || detailResolving;

  const detail = activity.data ?? undefined;

  if (!detail) {
    return (
      <MultisigPage title="Activity" backTo={backTo} onBack={onBack} maxWidth="685px">
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
  const status = onChainStatusDisplay[view.status];
  const link = explorerLink(view, settings.network);
  const counterpartyLabel = onchain.initiatedByUser ? 'To' : 'From';
  const feeFiat = toFiat(onchain.fee, marketData.data);
  const { balanceChanges } = onchain;
  const vaultLink =
    vaultId && vault.data ? { name: vault.data.name, to: multisigPaths.vault(vaultId) } : undefined;
  const accountLink =
    vaultId && accountId && account.data
      ? { name: account.data.name, to: multisigPaths.account(vaultId, accountId) }
      : undefined;

  return (
    <MultisigPage title="Activity" backTo={backTo} onBack={onBack} maxWidth="685px">
      <MultisigHero
        variant="balance"
        themeId={vaultThemeFromName(vault.data?.theme).id}
        primary={view.title || '—'}
        secondary={view.subtitle || formatRelativeTime(new Date(view.timestamp * 1000))}
      />

      <SectionLabel>Transaction details</SectionLabel>
      <DetailTable>
        <DetailStatusRow
          label={status.label}
          variant={status.variant}
          highlight={view.status === 'pending'}
        />
        <DetailLocationRow vault={vaultLink} account={accountLink} />
        {balanceChanges.length === 1 ? (
          <DetailRow label="Amount">{balanceChangeValue(balanceChanges[0])}</DetailRow>
        ) : (
          balanceChanges.map(change => (
            <DetailRow
              key={`${change.direction}-${change.amount.crypto.symbol}`}
              label={change.direction === 'sent' ? 'Sent' : 'Received'}
            >
              {balanceChangeValue(change)}
            </DetailRow>
          ))
        )}
        {onchain.counterparty ? (
          <DetailRow label={counterpartyLabel}>
            <CopyAddress addr={onchain.counterparty} emphasis />
          </DetailRow>
        ) : null}
        {onchain.fee ? (
          <DetailRow label="Network fee">{moneyWithFiat(onchain.fee, feeFiat)}</DetailRow>
        ) : null}
        <DetailRow label="Date">{formatRelativeTime(new Date(view.timestamp * 1000))}</DetailRow>
        <DetailRow label="Transaction ID">
          <CopyAddress addr={view.txid} emphasis />
        </DetailRow>
        <DetailRow label="Inputs and Outputs">
          {link ? (
            <ExternalLink href={link} withIcon>
              Explorer
            </ExternalLink>
          ) : (
            pendingValue
          )}
        </DetailRow>
      </DetailTable>
    </MultisigPage>
  );
}
