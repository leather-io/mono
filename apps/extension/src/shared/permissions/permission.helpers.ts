import { z } from 'zod';

import { isValidAccountIndex } from '@leather.io/crypto';
import {
  type AccountId,
  type BitcoinNetworkModes,
  bitcoinNetworkModesSchema,
} from '@leather.io/models';
import type { WalletStore } from '@leather.io/state/wallet';

import { getRootState } from '@shared/storage/get-root-state';
import { getOriginFromUrl } from '@shared/utils/urls';

export interface AppPermission extends AccountId {
  origin: string;
  // Very simple permission system. If property exists with date, user
  // has given permission
  requestedAccounts?: string;
  networkMode: BitcoinNetworkModes;
  policyId?: string;
}

const canonicalOriginSchema = z.string().refine(value => {
  try {
    return getOriginFromUrl(value) === value;
  } catch {
    return false;
  }
});

const appPermissionSchema = z.object({
  origin: canonicalOriginSchema,
  fingerprint: z.string().min(1),
  accountIndex: z.number().refine(isValidAccountIndex),
  requestedAccounts: z.string().min(1),
  networkMode: bitcoinNetworkModesSchema,
});

function isValidAppPermission(permission: unknown): permission is AppPermission {
  return appPermissionSchema.safeParse(permission).success;
}

export function isConnectedToExistingWallet(
  permission: unknown,
  walletEntities: Partial<Record<string, WalletStore>>
): boolean {
  if (!isValidAppPermission(permission)) return false;
  return !!walletEntities[permission.fingerprint];
}

export async function getPermissionsByOrigin(origin: string) {
  const rootstate = await getRootState();
  if (!rootstate) return null;
  const permission = rootstate.appPermissions.entities[origin];
  if (!isValidAppPermission(permission) || permission.origin !== origin) return null;
  return permission;
}
