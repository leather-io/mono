import { useQueries } from '@tanstack/react-query';

import type { VaultSummary } from '@leather.io/models';
import { getMultisigService } from '@leather.io/services';

import { useVaultActivity } from '../activity/use-vault-activity';
import { useMultisigNetworks } from '../auth/use-multisig-networks';
import { useSession } from '../auth/use-session';
import { retryMultisigQuery } from './use-vaults';
import { multisigVaultKeys } from './vault-query-keys';

// Aggregates transactions across every active vault's accounts for the dashboard
// feed: a nested fan-out (vault -> accounts -> transactions) over both networks,
// newest first. The backend lists only per account, so this is client-side.
export function useDashboardActivity(vaults: VaultSummary[]) {
  const { btc: btcNetwork, stx: stxNetwork } = useMultisigNetworks();
  const btcSession = useSession(btcNetwork);
  const stxSession = useSession(stxNetwork);

  const activeVaults = vaults.filter(
    vault => vault.membershipStatus === 'joined' && vault.status === 'active'
  );

  const accountResults = useQueries({
    queries: activeVaults.map(vault => {
      const isBtc = vault.network.startsWith('btc');
      const address = isBtc ? btcSession?.identity.address : stxSession?.identity.address;
      return {
        queryKey: multisigVaultKeys.accounts(vault.network, address, vault.id),
        queryFn: ({ signal }: { signal: AbortSignal }) =>
          getMultisigService().listVaultAccounts(vault.network, vault.id, signal),
        enabled: isBtc ? Boolean(btcSession) : Boolean(stxSession),
        retry: retryMultisigQuery,
      };
    }),
  });

  const accounts = accountResults.flatMap(result => result.data ?? []);
  const vaultNamesById = new Map(activeVaults.map(vault => [vault.id, vault.name]));
  const accountNamesById = new Map(accounts.map(account => [account.id, account.name]));
  const accountThresholdsById = new Map(
    accounts.map(account => [account.id, `${account.threshold} of ${account.signerCount}`])
  );

  const { items, isLoading: isLoadingActivity } = useVaultActivity(accounts, vaultNamesById);

  const isLoading =
    (activeVaults.length > 0 && accountResults.some(result => result.isLoading)) ||
    isLoadingActivity;

  return { items, isLoading, vaultNamesById, accountNamesById, accountThresholdsById };
}
