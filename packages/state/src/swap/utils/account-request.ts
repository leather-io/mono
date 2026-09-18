import { type AccountRequest } from '@leather.io/services';

import { type SwapDependencies } from '../swap-state.types';

export function toNativeSegwitAccountRequest(
  accountRequest: SwapDependencies['accountRequest']
): AccountRequest {
  return { ...accountRequest, exclusions: { taprootAddresses: true } };
}
