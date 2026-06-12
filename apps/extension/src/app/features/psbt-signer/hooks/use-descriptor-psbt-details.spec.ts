import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';

import {
  compileWshDescriptor,
  getAddressFromOutScript,
  getBtcSignerLibNetworkConfigByMode,
} from '@leather.io/bitcoin';

import { useDescriptorPsbtDetails } from './use-descriptor-psbt-details';

const mocks = vi.hoisted(() => ({
  useCurrentNetwork: vi.fn(),
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

vi.mock('@app/store/networks/networks.selectors', () => ({
  useCurrentNetwork: mocks.useCurrentNetwork,
}));

vi.mock('@shared/logger', () => ({
  logger: { error: vi.fn(), warn: vi.fn() },
}));

function requireBytes(bytes: Uint8Array | null) {
  if (!bytes) throw new Error('Expected key bytes to be defined');
  return bytes;
}

function makeNativeSegwitAccountXpub(seedByte: number) {
  return HDKey.fromMasterSeed(new Uint8Array(32).fill(seedByte)).derive("m/84'/0'/0'")
    .publicExtendedKey;
}

function makeNativeSegwitAddressPubkey(seedByte: number) {
  return requireBytes(
    HDKey.fromMasterSeed(new Uint8Array(32).fill(seedByte))
      .derive("m/84'/0'/0'")
      .deriveChild(0)
      .deriveChild(0).publicKey
  );
}

const descriptor = `wsh(pk(${makeNativeSegwitAccountXpub(1)}/0/0))`;
const bitcoinNetwork = getBtcSignerLibNetworkConfigByMode('mainnet');
const { scriptPubKey, witnessScript } = compileWshDescriptor(descriptor);
const policyAddress = getAddressFromOutScript(scriptPubKey, bitcoinNetwork);
const destinationAScript = btc.p2wpkh(makeNativeSegwitAddressPubkey(2)).script;
const destinationBScript = btc.p2wpkh(makeNativeSegwitAddressPubkey(3)).script;
const foreignInputScript = btc.p2wpkh(makeNativeSegwitAddressPubkey(4)).script;

interface BuildPolicyPsbtHexOptions {
  policyInputAmount?: bigint;
  foreignInputAmount?: bigint;
  destinations?: [Uint8Array, bigint][];
  changeToPolicy?: bigint;
  sighashType?: number;
}

function buildPolicyPsbtHex({
  policyInputAmount = 20_000n,
  foreignInputAmount,
  destinations = [[destinationAScript, 12_000n]],
  changeToPolicy,
  sighashType,
}: BuildPolicyPsbtHexOptions = {}) {
  const tx = new btc.Transaction({ allowUnknownInputs: true });
  tx.addInput({
    txid: hexToBytes('00'.repeat(32)),
    index: 0,
    witnessUtxo: { script: scriptPubKey, amount: policyInputAmount },
    witnessScript,
    ...(sighashType === undefined ? {} : { sighashType }),
  });
  if (foreignInputAmount !== undefined)
    tx.addInput({
      txid: hexToBytes('11'.repeat(32)),
      index: 0,
      witnessUtxo: { script: foreignInputScript, amount: foreignInputAmount },
    });
  for (const [script, amount] of destinations) tx.addOutput({ script, amount });
  if (changeToPolicy !== undefined) tx.addOutput({ script: scriptPubKey, amount: changeToPolicy });
  return bytesToHex(tx.toPSBT());
}

describe(useDescriptorPsbtDetails.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useCurrentNetwork.mockReturnValue({ chain: { bitcoin: { mode: 'mainnet' } } });
  });

  test('derives the policy address from the descriptor', () => {
    const details = useDescriptorPsbtDetails(buildPolicyPsbtHex(), descriptor);
    expect(details?.policyAddress).toBe(policyAddress);
  });

  test('lists every non-change destination and excludes change back to the policy', () => {
    const details = useDescriptorPsbtDetails(
      buildPolicyPsbtHex({
        destinations: [
          [destinationAScript, 12_000n],
          [destinationBScript, 3_000n],
        ],
        changeToPolicy: 4_000n,
      }),
      descriptor
    );
    expect(
      details?.destinations.map(destination => ({
        address: destination.address,
        value: destination.value.amount.toNumber(),
      }))
    ).toEqual([
      { address: getAddressFromOutScript(destinationAScript, bitcoinNetwork), value: 12_000 },
      { address: getAddressFromOutScript(destinationBScript, bitcoinNetwork), value: 3_000 },
    ]);
  });

  test('computes the amount leaving the policy net of change', () => {
    const details = useDescriptorPsbtDetails(
      buildPolicyPsbtHex({
        policyInputAmount: 20_000n,
        destinations: [[destinationAScript, 12_000n]],
        changeToPolicy: 5_000n,
      }),
      descriptor
    );
    expect(details?.amountLeavingPolicy.amount.toNumber()).toBe(15_000);
    expect(details?.amountLeavingPolicy.symbol).toBe('BTC');
  });

  test('computes the fee from all inputs and outputs, including foreign inputs', () => {
    const details = useDescriptorPsbtDetails(
      buildPolicyPsbtHex({
        policyInputAmount: 20_000n,
        foreignInputAmount: 10_000n,
        destinations: [
          [destinationAScript, 12_000n],
          [destinationBScript, 5_000n],
        ],
        changeToPolicy: 9_000n,
      }),
      descriptor
    );
    expect(details?.fee.amount.toNumber()).toBe(4_000);
    expect(details?.amountLeavingPolicy.amount.toNumber()).toBe(11_000);
  });

  test('does not flag the default and ALL sighash types', () => {
    expect(useDescriptorPsbtDetails(buildPolicyPsbtHex(), descriptor)?.hasDisallowedSighash).toBe(
      false
    );
    expect(
      useDescriptorPsbtDetails(buildPolicyPsbtHex({ sighashType: btc.SigHash.ALL }), descriptor)
        ?.hasDisallowedSighash
    ).toBe(false);
  });

  test('flags a disallowed sighash on a policy input', () => {
    expect(
      useDescriptorPsbtDetails(buildPolicyPsbtHex({ sighashType: btc.SigHash.NONE }), descriptor)
        ?.hasDisallowedSighash
    ).toBe(true);
  });

  test('treats an input without witnessUtxo as zero value and clamps the fee at zero', () => {
    const tx = new btc.Transaction({ allowUnknownInputs: true });
    tx.addInput({
      txid: hexToBytes('00'.repeat(32)),
      index: 0,
      witnessUtxo: { script: scriptPubKey, amount: 20_000n },
      witnessScript,
    });
    tx.addInput({ txid: hexToBytes('11'.repeat(32)), index: 0 });
    tx.addOutput({ script: destinationAScript, amount: 25_000n });

    const details = useDescriptorPsbtDetails(bytesToHex(tx.toPSBT()), descriptor);

    expect(details).not.toBeNull();
    expect(details?.fee.amount.toNumber()).toBe(0);
  });

  test('clamps the amount leaving the policy at zero when change exceeds the policy input', () => {
    const details = useDescriptorPsbtDetails(
      buildPolicyPsbtHex({
        policyInputAmount: 5_000n,
        foreignInputAmount: 20_000n,
        destinations: [[destinationAScript, 12_000n]],
        changeToPolicy: 8_000n,
      }),
      descriptor
    );

    expect(details?.amountLeavingPolicy.amount.toNumber()).toBe(0);
  });

  test('encodes the policy address for the active testnet network', () => {
    mocks.useCurrentNetwork.mockReturnValue({ chain: { bitcoin: { mode: 'testnet' } } });

    const details = useDescriptorPsbtDetails(buildPolicyPsbtHex(), descriptor);

    expect(details?.policyAddress).toBe(
      getAddressFromOutScript(scriptPubKey, getBtcSignerLibNetworkConfigByMode('testnet'))
    );
    expect(details?.policyAddress.startsWith('tb1')).toBe(true);
  });

  test('returns null when the descriptor cannot be compiled', () => {
    expect(useDescriptorPsbtDetails(buildPolicyPsbtHex(), 'not-a-descriptor')).toBeNull();
  });

  test('returns null when the psbt cannot be parsed', () => {
    expect(useDescriptorPsbtDetails('deadbeef', descriptor)).toBeNull();
  });
});
