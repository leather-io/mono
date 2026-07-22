import type { AccountId, BitcoinNetworkModes } from '@leather.io/models';
import type { WalletStore } from '@leather.io/state/wallet';

import { getRootState } from '@shared/storage/get-root-state';

export interface AppPermission extends AccountId {
  origin: string;
  // Very simple permission system. If property exists with date, user
  // has given permission
  requestedAccounts?: string;
  networkMode: BitcoinNetworkModes;
  policyId?: string;
}

function hasRequestedAccountPermission(permission?: AppPermission) {
  return !!permission?.requestedAccounts;
}

export function isConnectedToExistingWallet(
  permission: AppPermission | undefined,
  walletEntities: Partial<Record<string, WalletStore>>
): boolean {
  if (!permission || !hasRequestedAccountPermission(permission)) return false;
  if (!Number.isInteger(permission.accountIndex)) return false;
  return !!walletEntities[permission.fingerprint];
}

export async function getPermissionsByOrigin(hostname: string) {
  const rootstate = await getRootState();
  if (!rootstate) return null;
  return rootstate.appPermissions.entities[hostname] ?? null;
}
