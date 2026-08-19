import { sha256 } from '@noble/hashes/sha256';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';

import {
  compileWshDescriptor,
  getBondVaultKeys,
  getWshDescriptorAddress,
  instantiateBondDescriptor,
} from '@leather.io/bitcoin';
import { makeAccountIdentifer } from '@leather.io/crypto';
import { RpcErrorCode } from '@leather.io/rpc';

import { useBondProposalRoute } from './use-bond-proposal-route';

const mocks = vi.hoisted(() => ({
  useCurrentPolicy: vi.fn(),
}));

vi.mock('react', async importOriginal => {
  const actual = await importOriginal<typeof import('react')>();
  return {
    ...actual,
    useMemo<T>(factory: () => T) {
      return factory();
    },
  };
});

vi.mock('@app/store/policy/policy.selectors', () => ({
  useCurrentPolicy: mocks.useCurrentPolicy,
}));

function requireBytes(bytes: Uint8Array | null) {
  if (!bytes) throw new Error('Expected key bytes to be defined');
  return bytes;
}

function makeNativeSegwitAccountXpub(seedByte: number) {
  return HDKey.fromMasterSeed(new Uint8Array(32).fill(seedByte)).derive("m/84'/0'/0'")
    .publicExtendedKey;
}

function makeAddressPubkeyHex(seedByte: number) {
  return bytesToHex(
    requireBytes(
      HDKey.fromMasterSeed(new Uint8Array(32).fill(seedByte))
        .derive("m/84'/0'/0'")
        .deriveChild(0)
        .deriveChild(0).publicKey
    )
  );
}

const xpubA = makeNativeSegwitAccountXpub(1);
const xpubB = makeNativeSegwitAccountXpub(2);
const xpubC = makeNativeSegwitAccountXpub(3);
const counterpartyKey = makeAddressPubkeyHex(9);
const hash = bytesToHex(sha256(new Uint8Array([1, 2, 3])));
const unlockHeight = 1000;

const fingerprint = 'f1f1f1f1';
const accountIndex = 0;
const networkId = 'mainnet';

const policyDescriptor = `wsh(sortedmulti(2,${xpubA}/0/0,${xpubB}/0/0,${xpubC}/0/0))`;

const bitcoinPolicy = {
  id: 'policy-1',
  parentAccountId: makeAccountIdentifer(fingerprint, accountIndex),
  networkId,
  address: getWshDescriptorAddress(policyDescriptor),
  role: 'signer' as const,
  chain: 'bitcoin' as const,
  descriptor: policyDescriptor,
};

const bondDescriptor = instantiateBondDescriptor({
  unlockHeight,
  hash,
  counterpartyKey,
  ...getBondVaultKeys(policyDescriptor),
});

interface BuildBondPsbtOptions {
  foreignInput?: boolean;
  sighashType?: number;
}

function buildBondPsbtHex({ foreignInput, sighashType }: BuildBondPsbtOptions = {}) {
  const { scriptPubKey, witnessScript } = compileWshDescriptor(bondDescriptor);
  const tx = new btc.Transaction({ allowUnknownInputs: true });
  tx.addInput({
    txid: hexToBytes('11'.repeat(32)),
    index: 0,
    witnessUtxo: { script: scriptPubKey, amount: 50_000n },
    witnessScript,
    ...(sighashType === undefined ? {} : { sighashType }),
  });
  if (foreignInput) {
    const foreignKey = HDKey.fromMasterSeed(new Uint8Array(32).fill(7))
      .derive("m/84'/0'/0'")
      .deriveChild(0)
      .deriveChild(0);
    tx.addInput({
      txid: hexToBytes('22'.repeat(32)),
      index: 0,
      witnessUtxo: {
        script: btc.p2wpkh(requireBytes(foreignKey.publicKey)).script,
        amount: 10_000n,
      },
    });
  }
  const recipientKey = HDKey.fromMasterSeed(new Uint8Array(32).fill(8))
    .derive("m/84'/0'/0'")
    .deriveChild(0)
    .deriveChild(0);
  tx.addOutput({
    script: btc.p2wpkh(requireBytes(recipientKey.publicKey)).script,
    amount: 45_000n,
  });
  return bytesToHex(tx.toPSBT());
}

describe(useBondProposalRoute.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useCurrentPolicy.mockReturnValue(bitcoinPolicy);
  });

  test('returns null when the connection is not bound to a policy', () => {
    mocks.useCurrentPolicy.mockReturnValue(null);

    const route = useBondProposalRoute({
      descriptor: bondDescriptor,
      psbtHex: buildBondPsbtHex(),
    });
    expect(route).toBeNull();
  });

  test('returns null when the bound policy is not a bitcoin policy', () => {
    mocks.useCurrentPolicy.mockReturnValue({
      id: 'policy-stx',
      parentAccountId: makeAccountIdentifer(fingerprint, accountIndex),
      networkId,
      address: 'SM3CFXKD81GREH6MYFW4P9VKSSR2N525W3KDRH3P1',
      role: 'signer',
      chain: 'stacks',
      publicKeys: [],
      threshold: 2,
    });

    const route = useBondProposalRoute({
      descriptor: bondDescriptor,
      psbtHex: buildBondPsbtHex(),
    });
    expect(route).toBeNull();
  });

  test('matches a bond descriptor to the bound policy', () => {
    const route = useBondProposalRoute({
      descriptor: bondDescriptor,
      psbtHex: buildBondPsbtHex(),
    });
    expect(route).toEqual({
      status: 'matched',
      policy: bitcoinPolicy,
      bondDescriptor,
      unlockHeight,
      hash,
      counterpartyKey,
      vaultThreshold: 2,
      vaultKeyCount: 3,
    });
  });

  test('matches a cosmetically different dApp descriptor with reordered keys', () => {
    const reordered = `wsh(and_v(v:or_i(after(${unlockHeight}),and_v(v:sha256(${hash}),pk(${counterpartyKey}))),sortedmulti(2,${xpubC}/0/0,${xpubA}/0/0,${xpubB}/0/0)))`;
    const route = useBondProposalRoute({
      descriptor: reordered,
      psbtHex: buildBondPsbtHex(),
    });
    expect(route?.status).toBe('matched');
  });

  test('errors when the descriptor is missing', () => {
    const route = useBondProposalRoute({
      descriptor: undefined,
      psbtHex: buildBondPsbtHex(),
    });
    expect(route).toEqual(
      expect.objectContaining({ status: 'error', code: RpcErrorCode.INVALID_PARAMS })
    );
  });

  test('errors when the descriptor is not a bond template', () => {
    const route = useBondProposalRoute({
      descriptor: policyDescriptor,
      psbtHex: buildBondPsbtHex(),
    });
    expect(route).toEqual(
      expect.objectContaining({
        status: 'error',
        code: RpcErrorCode.INVALID_PARAMS,
        message: 'Descriptor is not a supported bond template',
      })
    );
  });

  test('errors when the bound policy does not match the bond keys', () => {
    const otherPolicyDescriptor = `wsh(sortedmulti(2,${xpubA}/0/1,${xpubB}/0/1,${xpubC}/0/1))`;
    mocks.useCurrentPolicy.mockReturnValue({
      ...bitcoinPolicy,
      descriptor: otherPolicyDescriptor,
    });

    const route = useBondProposalRoute({
      descriptor: bondDescriptor,
      psbtHex: buildBondPsbtHex(),
    });
    expect(route).toEqual(
      expect.objectContaining({
        status: 'error',
        code: RpcErrorCode.INVALID_REQUEST,
        message: 'Connected multisig account does not match this bond descriptor',
      })
    );
  });

  test('errors when the psbt carries inputs not locked by the bond descriptor', () => {
    const route = useBondProposalRoute({
      descriptor: bondDescriptor,
      psbtHex: buildBondPsbtHex({ foreignInput: true }),
    });
    expect(route).toEqual(
      expect.objectContaining({
        status: 'error',
        code: RpcErrorCode.INVALID_REQUEST,
        message: 'All PSBT inputs must be locked by the bond descriptor',
      })
    );
  });

  test('errors when a bond input requests a disallowed sighash', () => {
    const route = useBondProposalRoute({
      descriptor: bondDescriptor,
      psbtHex: buildBondPsbtHex({ sighashType: btc.SigHash.NONE }),
    });
    expect(route).toEqual(
      expect.objectContaining({
        status: 'error',
        code: RpcErrorCode.INVALID_REQUEST,
        message: 'Bond proposals only support SIGHASH_DEFAULT or SIGHASH_ALL inputs',
      })
    );
  });

  test('errors when the psbt hex is invalid', () => {
    const route = useBondProposalRoute({
      descriptor: bondDescriptor,
      psbtHex: 'not-a-psbt',
    });
    expect(route).toEqual(
      expect.objectContaining({ status: 'error', code: RpcErrorCode.INVALID_PARAMS })
    );
  });
});
