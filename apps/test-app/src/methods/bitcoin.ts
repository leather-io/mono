// Singlesig Bitcoin requests: transfers, PSBT signing, BIP-322 message signing.
//
// Transfers default to sending to the CONNECTED wallet's own address and the
// signPsbt entries build their PSBT from its own keys (one extra getAddresses
// prompt each), so they work on any Leather install. Sighash coverage lives in
// ./sighash.ts.
import { collectPsbtKeys } from '../builders/keys';
import { buildPsbtScenario } from '../builders/psbt';
import { BTC_RECIPIENT_OVERRIDE, TEST_MESSAGE } from '../constants';
import { networkModeOf } from '../networks';
import { type ParamsOf, type RpcMethodSpec, networkOf } from '../types';
import { verifySignedPsbt } from '../verifiers/spec-verifiers';
import { fetchAddresses, pickBtcAddress, resolveBtcRecipient } from '../wallet';

export const bitcoinMethods: RpcMethodSpec[] = [
  // ── sendTransfer ──────────────────────────────────────────────────────────
  {
    id: 'sendTransfer-single',
    method: 'sendTransfer',
    label: 'sendTransfer (1 recipient)',
    category: 'Bitcoin',
    description:
      '1,000 sats to your own native-segwit address (getAddresses prompt) — or to VITE_TEST_APP_BTC_RECIPIENT if set. On a funded wallet this broadcasts a real transaction; only the fee leaves.',
    async params(ctx) {
      return {
        recipients: [{ address: await resolveBtcRecipient(ctx), amount: '1000' }],
        network: networkOf(ctx),
      } satisfies ParamsOf<'sendTransfer'>;
    },
    expect: 'manual',
    requires: ['singlesig'],
    tags: ['funds'],
  },
  {
    id: 'sendTransfer-batch',
    method: 'sendTransfer',
    label: 'sendTransfer (batch)',
    category: 'Bitcoin',
    description:
      'Batched send to your own native-segwit (or VITE_TEST_APP_BTC_RECIPIENT) + your own taproot address.',
    async params(ctx) {
      const addresses = await fetchAddresses(ctx);
      return {
        recipients: [
          {
            address: BTC_RECIPIENT_OVERRIDE ?? pickBtcAddress(addresses, 'p2wpkh'),
            amount: '10000',
          },
          { address: pickBtcAddress(addresses, 'p2tr'), amount: '5000' },
        ],
        network: networkOf(ctx),
      } satisfies ParamsOf<'sendTransfer'>;
    },
    expect: 'manual',
    requires: ['singlesig'],
    tags: ['funds'],
  },
  {
    id: 'sendTransfer-legacy-params',
    method: 'sendTransfer',
    label: 'sendTransfer (legacy address/amount)',
    category: 'Bitcoin',
    description:
      'The pre-`recipients` param shape, still accepted by the schema: a single { address, amount }. Kept so the legacy branch does not rot.',
    async params(ctx) {
      return {
        address: await resolveBtcRecipient(ctx),
        amount: '1000',
        network: networkOf(ctx),
      } satisfies ParamsOf<'sendTransfer'>;
    },
    expect: 'manual',
    requires: ['singlesig'],
    tags: ['funds', 'legacy'],
  },
  {
    id: 'sendTransfer-no-broadcast',
    method: 'sendTransfer',
    label: 'sendTransfer (broadcast: false)',
    category: 'Bitcoin',
    description:
      'The wallet signs WITHOUT broadcasting. Response is { transaction } (raw signed tx hex) with no txid.',
    async params(ctx) {
      return {
        recipients: [{ address: await resolveBtcRecipient(ctx), amount: '10000' }],
        network: networkOf(ctx),
        broadcast: false,
      } satisfies ParamsOf<'sendTransfer'>;
    },
    expect: 'manual',
    requires: ['singlesig'],
    tags: ['funds'],
  },

  // ── signPsbt ──────────────────────────────────────────────────────────────
  {
    id: 'signPsbt',
    method: 'signPsbt',
    label: 'signPsbt (native segwit)',
    category: 'Bitcoin',
    description:
      'Reads your native-segwit key (getAddresses prompt), then asks to sign a PSBT spending a fictitious outpoint at that address back to itself. The wallet owns the key, so it signs and returns { hex }.',
    async params(ctx) {
      const keys = await collectPsbtKeys(ctx, ['p2wpkh']);
      const { psbtHex } = buildPsbtScenario({ inputs: [{ kind: 'p2wpkh' }] }, keys);
      return { hex: psbtHex, broadcast: false } satisfies ParamsOf<'signPsbt'>;
    },
    expect: 'success',
    requires: ['singlesig'],
    tags: ['ci', 'psbt'],
    verify: verifySignedPsbt({ signedIndexes: [0] }),
  },

  // ── signMessage (BIP-322) ─────────────────────────────────────────────────
  {
    id: 'signMessage-p2wpkh',
    method: 'signMessage',
    label: 'signMessage (p2wpkh)',
    category: 'Bitcoin',
    description: 'BIP-322 sign a message with the native-segwit key.',
    params(ctx) {
      return {
        message: TEST_MESSAGE,
        paymentType: 'p2wpkh',
        network: networkOf(ctx),
      } satisfies ParamsOf<'signMessage'>;
    },
    expect: 'success',
    requires: ['singlesig'],
    tags: ['ci'],
  },
  {
    id: 'signMessage-p2tr',
    method: 'signMessage',
    label: 'signMessage (p2tr)',
    category: 'Bitcoin',
    description: 'BIP-322 sign a message with the taproot key.',
    params(ctx) {
      return {
        message: TEST_MESSAGE,
        paymentType: 'p2tr',
        network: networkOf(ctx),
      } satisfies ParamsOf<'signMessage'>;
    },
    expect: 'success',
    requires: ['singlesig'],
    tags: ['ci', 'taproot'],
  },

  // ── Negative ──────────────────────────────────────────────────────────────
  {
    id: 'sendTransfer-wrong-network-address',
    method: 'sendTransfer',
    label: 'sendTransfer (wrong-network address)',
    category: 'Bitcoin',
    description:
      'A regtest bcrt1 address sent as a mainnet transfer. The wallet must reject the address rather than build a transaction nobody can broadcast.',
    params: {
      recipients: [{ address: 'bcrt1qvz04jt55sy7a4e9fg447gm2zlmnjck3dhdw5gf', amount: '1000' }],
      network: 'mainnet',
    } satisfies ParamsOf<'sendTransfer'>,
    expect: { extension: { error: -32602 } },
    tags: ['ci', 'negative'],
  },
  {
    id: 'signPsbt-bogus-sighash',
    method: 'signPsbt',
    label: 'signPsbt (bogus sighash 0x04)',
    category: 'Bitcoin',
    description:
      '0x04 is not a valid BIP-143 flag. Whitelisted or not, no signature should come back carrying it.',
    async params(ctx) {
      const keys = await collectPsbtKeys(ctx, ['p2wpkh']);
      const { psbtHex } = buildPsbtScenario({ inputs: [{ kind: 'p2wpkh', sighash: 0x04 }] }, keys);
      return {
        hex: psbtHex,
        allowedSighash: [0x04],
        broadcast: false,
      } satisfies ParamsOf<'signPsbt'>;
    },
    expect: 'manual',
    requires: ['singlesig'],
    tags: ['negative', 'sighash'],
    verify: verifySignedPsbt({ expectUnsigned: true }),
  },
  {
    id: 'signMessage-network-mismatch',
    method: 'signMessage',
    label: 'signMessage (network mismatch)',
    category: 'Bitcoin',
    description:
      'Asks for a BIP-322 signature on a network the run is not pinned to, so the address in the response should not match the selected account.',
    params(ctx) {
      return {
        message: TEST_MESSAGE,
        paymentType: 'p2wpkh',
        network: networkModeOf(networkOf(ctx)) === 'mainnet' ? 'testnet4' : 'mainnet',
      } satisfies ParamsOf<'signMessage'>;
    },
    expect: 'manual',
    tags: ['negative'],
  },
];
