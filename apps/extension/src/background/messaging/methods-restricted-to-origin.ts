import { type RpcRequests, btcAddAccount, stxAddAccount } from '@leather.io/rpc';

import { policyAllowedOrigin } from '@shared/constants';

// Methods that may only be called by a single trusted origin. Policy account
// registration is restricted to the multisig dApp; any other origin is denied.
export const methodsRestrictedToOrigin = new Set<RpcRequests['method']>([
  btcAddAccount.method,
  stxAddAccount.method,
]);

export function isOriginAllowedForRestrictedMethod(origin: string | undefined) {
  return origin === policyAllowedOrigin;
}
