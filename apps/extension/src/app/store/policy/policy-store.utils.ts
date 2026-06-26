import { type AccountId } from '@leather.io/models';
import { truncateMiddle } from '@leather.io/utils';

// A policy is a multisig the active singlesig account is a cosigner of:
// BTC via a `wsh(...)` descriptor, STX via ordered public keys + threshold. It is
// keyed by `${parentAccountId}/${address}/${networkId}`, so the same multisig can
// be associated with more than one singlesig account and network at a time.
type PolicyRole = 'signer';

interface BasePolicyStore {
  id: string;
  parentAccountId: string;
  networkId: string;
  address: string;
  role: PolicyRole;
}

export interface BitcoinPolicyStore extends BasePolicyStore {
  chain: 'bitcoin';
  descriptor: string;
}

export interface StacksPolicyStore extends BasePolicyStore {
  chain: 'stacks';
  publicKeys: string[];
  threshold: number;
}

export type PolicyStore = BitcoinPolicyStore | StacksPolicyStore;

export function makePolicyId(parentAccountId: string, address: string, networkId: string) {
  return `${parentAccountId}/${address}/${networkId}`;
}

export function parsePolicyParent(policyIdOrParentAccountId: string): AccountId {
  const [fingerprint, accountIndex] = policyIdOrParentAccountId.split('/');
  return { fingerprint, accountIndex: Number(accountIndex) };
}

export function getPolicyDisplayName(policy: PolicyStore, name?: string): string {
  return name ?? `Multisig ${truncateMiddle(policy.address, 4)}`;
}
