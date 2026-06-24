// A policy account is a multisig the active singlesig account is a cosigner of:
// BTC via a `wsh(...)` descriptor, STX via ordered public keys + threshold. It is
// keyed by `${parentAccountId}/${address}`, so the same multisig can be
// associated with more than one singlesig account at a time.
type PolicyRole = 'signer' | 'watch-only';

interface BasePolicyStore {
  id: string;
  parentAccountId: string;
  address: string;
  role: PolicyRole;
}

interface BitcoinPolicyStore extends BasePolicyStore {
  chain: 'bitcoin';
  descriptor: string;
}

interface StacksPolicyStore extends BasePolicyStore {
  chain: 'stacks';
  publicKeys: string[];
  threshold: number;
}

export type PolicyStore = BitcoinPolicyStore | StacksPolicyStore;

export function makePolicyId(parentAccountId: string, address: string) {
  return `${parentAccountId}/${address}`;
}
