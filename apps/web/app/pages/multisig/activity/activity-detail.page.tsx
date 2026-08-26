import { useEffect, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router';

import { Box, Flex } from 'leather-styles/jsx';
import { useMultisigNetworks } from '~/features/multisig/auth/use-multisig-networks';
import { useSession } from '~/features/multisig/auth/use-session';
import { useIsRestoringSession } from '~/features/multisig/auth/use-session-bootstrap';
import { getMultisigAccountAddresses } from '~/features/multisig/vaults/multisig-account-addresses';
import { useVaultAccount } from '~/features/multisig/vaults/use-vault-accounts';
import { useVault, useVaults } from '~/features/multisig/vaults/use-vaults';
import { useUserSettings } from '~/hooks/use-user-settings';
import { useBlockchainActivityByTxIdDetailQuery } from '~/queries/activity/blockchain-activity.query';
import { useMarketDataQuery } from '~/queries/market-data/market-data.query';

import { btcAsset, stxAsset } from '@leather.io/constants';
import type { AuthNetworkId } from '@leather.io/models';

import { toFiat } from '../components/detail-table';
import { MultisigErrorState } from '../components/multisig-error-state';
import { MultisigPage } from '../components/multisig-page';
import { VaultActivityDetail } from '../components/vault-activity-detail';
import { vaultThemeFromName } from '../multisig-tokens';
import { multisigPaths } from '../multisig.constants';

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

  const activity = useBlockchainActivityByTxIdDetailQuery(
    accountAddresses,
    txid ?? '',
    settings,
    Boolean(account.data && txid)
  );

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

  const feeFiat = toFiat(detail.activity.fee, marketData.data);
  const vaultLink =
    vaultId && vault.data ? { name: vault.data.name, to: multisigPaths.vault(vaultId) } : undefined;
  const accountLink =
    vaultId && accountId && account.data
      ? { name: account.data.name, to: multisigPaths.account(vaultId, accountId) }
      : undefined;

  return (
    <MultisigPage title="Activity" backTo={backTo} onBack={onBack} maxWidth="685px">
      <VaultActivityDetail
        item={detail}
        themeId={vaultThemeFromName(vault.data?.theme).id}
        network={settings.network}
        vaultLink={vaultLink}
        accountLink={accountLink}
        feeFiat={feeFiat}
      />
    </MultisigPage>
  );
}
