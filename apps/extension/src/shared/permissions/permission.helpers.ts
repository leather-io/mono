import type { AccountId, BitcoinNetworkModes } from '@leather.io/models';

import { getRootState } from '@shared/storage/get-root-state';

export interface AppPermission extends AccountId {
  origin: string;
  // Very simple permission system. If property exists with date, user
  // has given permission
  requestedAccounts?: string;
  networkMode: BitcoinNetworkModes;
}

export function hasRequestedAccountPermission(permission?: AppPermission) {
  return !!permission?.requestedAccounts;
}

export async function getPermissionsByOrigin(hostname: string) {
  const rootstate = await getRootState();
  if (!rootstate) return null;
  return rootstate.appPermissions.entities[hostname] ?? null;
}
