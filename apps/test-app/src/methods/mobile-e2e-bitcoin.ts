import * as btc from '@scure/btc-signer';

import { getBtcSignerLibNetworkConfigByMode } from '@leather.io/bitcoin';

import { collectPsbtKeys } from '../builders/keys';
import { type PsbtInputKind, buildPsbtScenario, foreignScript } from '../builders/psbt';
import { TEST_MESSAGE } from '../constants';
import { isRecord, readString } from '../guards';
import { networkModeOf } from '../networks';
import {
  type Expectation,
  type ParamsOf,
  type RequestContext,
  type RpcMethodSpec,
  type Verifier,
  networkOf,
} from '../types';
import {
  verifyAccountAddresses,
  verifyBip322Signature,
  verifyBroadcastPsbt,
  verifyBtcAccountIndex,
  verifyBtcPrefixes,
  verifyBtcTransfer,
} from '../verifiers/mobile-e2e-bitcoin';
import { verifyStxAddresses } from '../verifiers/mobile-e2e-stacks';
import { verifyAddresses, verifySignedPsbt } from '../verifiers/spec-verifiers';
import { fetchAddresses, isWalletAddress, pickBtcAddress } from '../wallet';

const rejected: Expectation = { error: 4001 };
const broadcastFailed: Expectation = { error: 4002 };
const mockedNativeSegwitPrevoutSats = 600_000n;

function externalRecipient(ctx: RequestContext) {
  const network = getBtcSignerLibNetworkConfigByMode(networkModeOf(networkOf(ctx)));
  return btc.Address(network).encode(btc.OutScript.decode(foreignScript().script));
}

function cachedAddresses(ctx: RequestContext) {
  return fetchAddresses(ctx, { allowPolicyAccounts: false });
}

function stxAddressesIn(result: unknown) {
  if (Array.isArray(result))
    return result.filter(isRecord).flatMap(entry => {
      const address = readString(entry, 'address');
      return address ? [address] : [];
    });
  if (isRecord(result) && Array.isArray(result.addresses))
    return result.addresses
      .filter(isWalletAddress)
      .filter(entry => entry.symbol === 'STX')
      .map(entry => entry.address);
  return [];
}

function verifyStxPrefix(prefix: string): Verifier {
  return ({ result }) => {
    const addresses = stxAddressesIn(result);
    const ok = addresses.length > 0 && addresses.every(address => address.startsWith(prefix));
    return {
      ok,
      checks: [
        {
          label: `every STX address starts with ${prefix}`,
          ok,
          detail: addresses.join(', ') || 'none',
        },
      ],
    };
  };
}

interface PsbtCardOptions {
  id: string;
  label: string;
  description: string;
  inputs: PsbtInputKind[];
  broadcast: boolean;
  signAtIndex?: number;
  expect: Expectation;
  verify?: Verifier;
}

function psbtCard({
  id,
  label,
  description,
  inputs,
  broadcast,
  signAtIndex,
  expect,
  verify,
}: PsbtCardOptions): RpcMethodSpec {
  return {
    id,
    method: 'signPsbt',
    label,
    category: 'Mobile E2E',
    description,
    async params(ctx) {
      const keys = await collectPsbtKeys(ctx, inputs);
      const { psbtHex } = buildPsbtScenario({ inputs: inputs.map(kind => ({ kind })) }, keys);
      return {
        hex: psbtHex,
        broadcast,
        network: networkOf(ctx),
        ...(signAtIndex !== undefined ? { signAtIndex } : {}),
      } satisfies ParamsOf<'signPsbt'>;
    },
    expect,
    requires: ['singlesig'],
    tags: ['mobile-e2e', 'psbt'],
    verify,
  };
}

export const mobileE2eBitcoinMethods: RpcMethodSpec[] = [
  {
    id: 'e2eBtc-prime-keys',
    method: 'getAddresses',
    label: 'e2e prime keys',
    category: 'Mobile E2E',
    description:
      'Connects and caches the getAddresses answer the PSBT and transfer builders read, so each later card raises one prompt.',
    params(ctx) {
      return {
        network: networkOf(ctx),
        allowPolicyAccounts: false,
      } satisfies ParamsOf<'getAddresses'>;
    },
    expect: 'success',
    requires: ['singlesig'],
    tags: ['mobile-e2e'],
    verify: verifyAddresses({ bitcoin: true, stacks: true }),
  },
  psbtCard({
    id: 'e2eBtc-signPsbt-broadcast-2in',
    label: 'e2e signPsbt broadcast 2 segwit inputs',
    description: 'Two native-segwit inputs, broadcast. Both must be signed and a txid returned.',
    inputs: ['p2wpkh', 'p2wpkh'],
    broadcast: true,
    expect: 'success',
    verify: verifyBroadcastPsbt(),
  }),
  psbtCard({
    id: 'e2eBtc-signPsbt-sign-at-index',
    label: 'e2e signPsbt sign input 0 only',
    description: 'Two native-segwit inputs, signAtIndex 0, no broadcast. Only input 0 is signed.',
    inputs: ['p2wpkh', 'p2wpkh'],
    broadcast: false,
    signAtIndex: 0,
    expect: 'success',
    verify: verifySignedPsbt({ signedIndexes: [0] }),
  }),
  psbtCard({
    id: 'e2eBtc-signPsbt-reject',
    label: 'e2e signPsbt reject',
    description: 'One native-segwit input. Cancel it: the wallet answers 4001.',
    inputs: ['p2wpkh'],
    broadcast: false,
    expect: rejected,
  }),
  psbtCard({
    id: 'e2eBtc-signPsbt-bad-index',
    label: 'e2e signPsbt invalid index',
    description:
      'Two inputs, signAtIndex 4. Signing fails with Failed to sign; closing the error answers 4001, as on the extension.',
    inputs: ['p2wpkh', 'p2wpkh'],
    broadcast: false,
    signAtIndex: 4,
    expect: rejected,
  }),
  psbtCard({
    id: 'e2eBtc-signPsbt-broadcast-fail',
    label: 'e2e signPsbt failed broadcast',
    description:
      'One input, broadcast against a failing node. The wallet answers 4002 with no user action.',
    inputs: ['p2wpkh'],
    broadcast: true,
    expect: broadcastFailed,
  }),
  psbtCard({
    id: 'e2eBtc-signPsbt-taproot-broadcast',
    label: 'e2e signPsbt broadcast 2 taproot inputs',
    description: 'Two taproot inputs, broadcast. Both must be signed and a txid returned.',
    inputs: ['p2tr', 'p2tr'],
    broadcast: true,
    expect: 'success',
    verify: verifyBroadcastPsbt(),
  }),
  psbtCard({
    id: 'e2eBtc-signPsbt-taproot-index',
    label: 'e2e signPsbt sign taproot input 0 only',
    description: 'Two taproot inputs, signAtIndex 0, no broadcast. Only input 0 is signed.',
    inputs: ['p2tr', 'p2tr'],
    broadcast: false,
    signAtIndex: 0,
    expect: 'success',
    verify: verifySignedPsbt({ signedIndexes: [0] }),
  }),
  psbtCard({
    id: 'e2eBtc-signPsbt-taproot-reject',
    label: 'e2e signPsbt taproot reject',
    description: 'One taproot input. Cancel it: the wallet answers 4001.',
    inputs: ['p2tr'],
    broadcast: false,
    expect: rejected,
  }),
  psbtCard({
    id: 'e2eBtc-signPsbt-mixed-broadcast',
    label: 'e2e signPsbt broadcast mixed inputs',
    description: 'A native-segwit and a taproot input, broadcast. Both signed, txid returned.',
    inputs: ['p2wpkh', 'p2tr'],
    broadcast: true,
    expect: 'success',
    verify: verifyBroadcastPsbt(),
  }),
  psbtCard({
    id: 'e2eBtc-signPsbt-mixed-index',
    label: 'e2e signPsbt sign mixed input 1 only',
    description: 'Native-segwit + taproot, signAtIndex 1, no broadcast. Only the taproot input.',
    inputs: ['p2wpkh', 'p2tr'],
    broadcast: false,
    signAtIndex: 1,
    expect: 'success',
    verify: verifySignedPsbt({ signedIndexes: [1] }),
  }),
  {
    id: 'e2eBtc-signMessage-approve',
    method: 'signMessage',
    label: 'e2e signMessage approve',
    category: 'Mobile E2E',
    description:
      'BIP-322 message with the native-segwit key. The signature must verify for your address and the message.',
    params(ctx) {
      return {
        message: TEST_MESSAGE,
        paymentType: 'p2wpkh',
        network: networkOf(ctx),
      } satisfies ParamsOf<'signMessage'>;
    },
    expect: 'success',
    requires: ['singlesig'],
    tags: ['mobile-e2e'],
    verify: verifyBip322Signature(),
  },
  {
    id: 'e2eBtc-signMessage-reject',
    method: 'signMessage',
    label: 'e2e signMessage reject',
    category: 'Mobile E2E',
    description: 'BIP-322 message request. Cancel it: the wallet answers 4001.',
    params(ctx) {
      return {
        message: TEST_MESSAGE,
        paymentType: 'p2wpkh',
        network: networkOf(ctx),
      } satisfies ParamsOf<'signMessage'>;
    },
    expect: rejected,
    requires: ['singlesig'],
    tags: ['mobile-e2e'],
  },
  {
    id: 'e2eBtc-getAddresses-approve',
    method: 'getAddresses',
    label: 'e2e getAddresses approve',
    category: 'Mobile E2E',
    description:
      'Share Account 1. The p2wpkh and p2tr paths are at account index 0, there is one STX address, and every address belongs to its returned public key.',
    params(ctx) {
      return { network: networkOf(ctx) } satisfies ParamsOf<'getAddresses'>;
    },
    expect: 'success',
    tags: ['mobile-e2e'],
    verify: verifyAccountAddresses(0),
  },
  {
    id: 'e2eBtc-getAddresses-reject',
    method: 'getAddresses',
    label: 'e2e getAddresses reject',
    category: 'Mobile E2E',
    description: 'Cancel the connect prompt: the wallet answers 4001.',
    params(ctx) {
      return { network: networkOf(ctx) } satisfies ParamsOf<'getAddresses'>;
    },
    expect: rejected,
    tags: ['mobile-e2e'],
  },
  {
    id: 'e2eBtc-stx-getAddresses-approve',
    method: 'stx_getAddresses',
    label: 'e2e stx_getAddresses approve',
    category: 'Mobile E2E',
    description:
      'Share Account 1. One STX address comes back, with the network prefix, matching its public key at account index 0.',
    params(ctx) {
      return { network: networkOf(ctx) } satisfies ParamsOf<'stx_getAddresses'>;
    },
    expect: 'success',
    tags: ['mobile-e2e'],
    verify: verifyStxAddresses(0),
  },
  {
    id: 'e2eBtc-stx-getAddresses-reject',
    method: 'stx_getAddresses',
    label: 'e2e stx_getAddresses reject',
    category: 'Mobile E2E',
    description: 'Cancel the Stacks connect prompt: the wallet answers 4001.',
    params(ctx) {
      return { network: networkOf(ctx) } satisfies ParamsOf<'stx_getAddresses'>;
    },
    expect: rejected,
    tags: ['mobile-e2e'],
  },
  {
    id: 'e2eBtc-getAddresses-testnet',
    method: 'getAddresses',
    label: 'e2e getAddresses testnet param',
    category: 'Mobile E2E',
    description: 'Asks for testnet addresses whatever the wallet network. The first BTC is tb1q.',
    params: { network: 'testnet' } satisfies ParamsOf<'getAddresses'>,
    expect: 'success',
    tags: ['mobile-e2e'],
    verify: verifyBtcPrefixes({ p2wpkh: 'tb1q', p2tr: 'tb1p' }),
  },
  {
    id: 'e2eBtc-stx-getAddresses-testnet',
    method: 'stx_getAddresses',
    label: 'e2e stx_getAddresses testnet param',
    category: 'Mobile E2E',
    description: 'Asks for testnet Stacks addresses whatever the wallet network. They start ST.',
    params: { network: 'testnet' } satisfies ParamsOf<'stx_getAddresses'>,
    expect: 'success',
    tags: ['mobile-e2e'],
    verify: verifyStxPrefix('ST'),
  },
  {
    id: 'e2eBtc-getAddresses-account-2',
    method: 'getAddresses',
    label: 'e2e getAddresses second account',
    category: 'Mobile E2E',
    description: 'Pick the second account in the prompt. The p2wpkh path is at account index 1.',
    params(ctx) {
      return { network: networkOf(ctx) } satisfies ParamsOf<'getAddresses'>;
    },
    expect: 'success',
    tags: ['mobile-e2e'],
    verify: verifyBtcAccountIndex(1),
  },
  {
    id: 'e2eBtc-stx-getAddresses-account-2',
    method: 'stx_getAddresses',
    label: 'e2e stx_getAddresses second account',
    category: 'Mobile E2E',
    description: 'Pick the second account in the prompt. The STX path is at account index 1.',
    params(ctx) {
      return { network: networkOf(ctx) } satisfies ParamsOf<'stx_getAddresses'>;
    },
    expect: 'success',
    tags: ['mobile-e2e'],
    verify: verifyStxAddresses(1),
  },
  {
    id: 'e2eBtc-getAddresses-chains-stacks',
    method: 'getAddresses',
    label: 'e2e getAddresses chains stacks',
    category: 'Mobile E2E',
    description: 'chains: [stacks]. Only STX addresses come back.',
    params(ctx) {
      return { network: networkOf(ctx), chains: ['stacks'] } satisfies ParamsOf<'getAddresses'>;
    },
    expect: 'success',
    tags: ['mobile-e2e'],
    verify: verifyAddresses({ bitcoin: false, stacks: true }),
  },
  {
    id: 'e2eBtc-getAddresses-chains-bitcoin',
    method: 'getAddresses',
    label: 'e2e getAddresses chains bitcoin',
    category: 'Mobile E2E',
    description: 'chains: [bitcoin]. Only BTC addresses come back.',
    params(ctx) {
      return { network: networkOf(ctx), chains: ['bitcoin'] } satisfies ParamsOf<'getAddresses'>;
    },
    expect: 'success',
    tags: ['mobile-e2e'],
    verify: verifyAddresses({ bitcoin: true, stacks: false }),
  },
  {
    id: 'e2eBtc-getAddresses-chains-empty',
    method: 'getAddresses',
    label: 'e2e getAddresses chains empty',
    category: 'Mobile E2E',
    description:
      'chains: []. The wallet rejects it with invalid params, no prompt. Not typed with satisfies: the schema forbids an empty list.',
    params(ctx) {
      return { network: networkOf(ctx), chains: [] };
    },
    expect: { error: -32602 },
    tags: ['mobile-e2e'],
  },
  {
    id: 'e2eBtc-sendTransfer-two-recipients',
    method: 'sendTransfer',
    label: 'e2e sendTransfer two recipients',
    category: 'Mobile E2E',
    description:
      '800 + 900 sats to a fixed external address, broadcast. The returned transaction pays both, sends the rest back to your native-segwit address, is signed by your key over the mocked prevout and matches the txid.',
    params(ctx) {
      const address = externalRecipient(ctx);
      return {
        recipients: [
          { address, amount: '800' },
          { address, amount: '900' },
        ],
        network: networkOf(ctx),
      } satisfies ParamsOf<'sendTransfer'>;
    },
    expect: 'success',
    requires: ['singlesig'],
    tags: ['mobile-e2e', 'funds'],
    verify: verifyBtcTransfer({ broadcast: true, prevoutSats: mockedNativeSegwitPrevoutSats }),
  },
  {
    id: 'e2eBtc-sendTransfer-no-broadcast',
    method: 'sendTransfer',
    label: 'e2e sendTransfer no broadcast',
    category: 'Mobile E2E',
    description:
      'broadcast: false, 800 + 900 sats to a fixed external address. The signed transaction pays both, sends the rest back to your native-segwit address, is signed by your key over the mocked prevout, and no txid comes back.',
    params(ctx) {
      const address = externalRecipient(ctx);
      return {
        recipients: [
          { address, amount: '800' },
          { address, amount: '900' },
        ],
        network: networkOf(ctx),
        broadcast: false,
      } satisfies ParamsOf<'sendTransfer'>;
    },
    expect: 'success',
    requires: ['singlesig'],
    tags: ['mobile-e2e'],
    verify: verifyBtcTransfer({ broadcast: false, prevoutSats: mockedNativeSegwitPrevoutSats }),
  },
  {
    id: 'e2eBtc-sendTransfer-reject',
    method: 'sendTransfer',
    label: 'e2e sendTransfer reject',
    category: 'Mobile E2E',
    description: '800 sats to your own address. Cancel it: the wallet answers 4001.',
    async params(ctx) {
      const address = pickBtcAddress(await cachedAddresses(ctx), 'p2wpkh');
      return {
        recipients: [{ address, amount: '800' }],
        network: networkOf(ctx),
      } satisfies ParamsOf<'sendTransfer'>;
    },
    expect: rejected,
    requires: ['singlesig'],
    tags: ['mobile-e2e'],
  },
];
