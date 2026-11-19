import type { AccountRequest } from '../types';

interface TestAccountRequestOptions {
  stxAddress?: string;
  includeHiddenAssets?: boolean;
}

export function createTestAccountRequest({
  stxAddress,
  includeHiddenAssets,
}: TestAccountRequestOptions = {}): AccountRequest {
  return {
    account: {
      id: { fingerprint: 'deadbeef', accountIndex: 0 },
      ...(stxAddress === undefined ? {} : { stacks: { stxAddress } }),
    },
    ...(includeHiddenAssets === undefined ? {} : { assets: { includeHiddenAssets } }),
  };
}
