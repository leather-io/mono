import {
  getTestSoftwareAccountDefaultWalletState,
  testFingerprint,
} from '@tests/page-object-models/onboarding.page';

// The default test account is `${testFingerprint}/0`. Policies nest beneath it.
const testPolicyParentAccountId = `${testFingerprint}/0`;

// A compilable `wsh(sortedmulti(...))` descriptor built from the test account's
// real native-segwit and taproot xpubs. The injected policy flows (switch / home /
// manage / getAddresses) never re-derive or re-verify a stored policy, so the
// address below is a static, valid mainnet P2WSH address rather than one derived
// from this descriptor.
export const exampleWshDescriptor =
  'wsh(sortedmulti(2,xpub6BuKrNqTrGfsy8VAAdUW2KCxbHywuSKjg7hZuAXERXDv7GfuxUgUWdVRKNsgujcwdjEHCjaXWouPKi1m5gMgdWX8JpRcyMkrSxPe4Da3Lx8/0/0,xpub6C4MQD2bVDTfdnVe5AYKB6gE7BE4yQeKBRgukQ4Hi3phDB5fCYKEAdViQ2n7kZQ1t728QV4wKGgiR5qGigjNNrm5DCGWYUZDRVNWYb8ZWGK/0/0))';

const exampleBitcoinMultisigAddress =
  'bc1qrp33g0q5c5txsp9arysrx4k6zdkfs4nce4xj0gdcccefvpysxf3qccfmv3';

const exampleStacksMultisigAddress = 'SM3CFXKD81GREH6MYFW4P9VKSSR2N525W3KDRH3P1';

export const exampleStacksMultisigPublicKeys = [
  '0329b076bc20f7b1592b2a1a5cb91dfefe8c966e50e256458e23dd2c5d63f8f1af',
  '0347b913aed4ee088b6fea3e9537836a1c8f1b72111cf010af5589d93f3a433f02',
];

interface BitcoinTestPolicy {
  id: string;
  parentAccountId: string;
  networkId: string;
  chain: 'bitcoin';
  address: string;
  descriptor: string;
  role: 'signer';
}

interface StacksTestPolicy {
  id: string;
  parentAccountId: string;
  networkId: string;
  chain: 'stacks';
  address: string;
  publicKeys: string[];
  threshold: number;
  role: 'signer';
}

type TestPolicy = BitcoinTestPolicy | StacksTestPolicy;

function makePolicyId(parentAccountId: string, address: string, networkId: string) {
  return `${parentAccountId}/${address}/${networkId}`;
}

export function makeBitcoinPolicy({
  address = exampleBitcoinMultisigAddress,
  descriptor = exampleWshDescriptor,
  networkId = 'mainnet',
} = {}): BitcoinTestPolicy {
  return {
    id: makePolicyId(testPolicyParentAccountId, address, networkId),
    parentAccountId: testPolicyParentAccountId,
    networkId,
    chain: 'bitcoin',
    address,
    descriptor,
    role: 'signer',
  };
}

export function makeStacksPolicy({
  address = exampleStacksMultisigAddress,
  publicKeys = exampleStacksMultisigPublicKeys,
  threshold = 2,
  networkId = 'mainnet',
} = {}): StacksTestPolicy {
  return {
    id: makePolicyId(testPolicyParentAccountId, address, networkId),
    parentAccountId: testPolicyParentAccountId,
    networkId,
    chain: 'stacks',
    address,
    publicKeys,
    threshold,
    role: 'signer',
  };
}

interface PolicyStateOverridesArgs {
  policies: TestPolicy[];
  activePolicyId?: string;
  names?: Record<string, string>;
}

// Builds the `signInWithTestAccount` state override that seeds the policy slice
// (the registered multisigs), the accounts slice (their optional name overrides),
// and the active slice (which multisig, if any, starts active). The merge in
// `signInWithTestAccount` is shallow, so each slice is returned complete.
export function policyStateOverrides({
  policies,
  activePolicyId,
  names = {},
}: PolicyStateOverridesArgs) {
  const base = getTestSoftwareAccountDefaultWalletState();
  return {
    policy: {
      ids: policies.map(policy => policy.id),
      entities: Object.fromEntries(policies.map(policy => [policy.id, policy])),
    },
    accounts: {
      ids: [...base.accounts.ids, ...policies.map(policy => policy.id)],
      entities: {
        ...base.accounts.entities,
        ...Object.fromEntries(
          policies.map(policy => [
            policy.id,
            names[policy.id]
              ? { id: policy.id, name: names[policy.id], status: 'active' }
              : { id: policy.id },
          ])
        ),
      },
    },
    active: {
      ...base.active,
      activePolicyId: activePolicyId ?? null,
    },
  };
}
