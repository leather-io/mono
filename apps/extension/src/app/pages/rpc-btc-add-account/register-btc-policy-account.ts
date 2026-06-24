import { type RpcParams, type RpcResult, btcAddAccount } from '@leather.io/rpc';

// Placeholder registration step. This is where the validated policy account will
// later be saved to extension state, and where the real address / accountId /
// role will be derived. For now it echoes back a typed, stubbed result so the
// RPC flow is end-to-end exercisable.
// TODO: replace with the real save-to-state + derivation implementation.
export function registerBtcPolicyAccount(
  params: RpcParams<typeof btcAddAccount>
): RpcResult<typeof btcAddAccount> {
  return {
    address: '',
    descriptor: params.descriptor,
    accountId: '',
    role: 'watch-only',
  };
}
