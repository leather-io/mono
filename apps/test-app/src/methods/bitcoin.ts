// Singlesig Bitcoin requests: transfers, PSBT signing, BIP-322 message signing.
//
// Transfers default to sending to the CONNECTED wallet's own address and the
// signPsbt entries build their PSBT from its own key (one extra getAddresses
// prompt each), so they work on any Leather install.
import { BTC_RECIPIENT_OVERRIDE, SIGHASH, TEST_MESSAGE } from '../constants';
import type { ParamsOf, RpcMethodSpec } from '../types';
import {
  fetchAddresses,
  fetchNativeSegwitPubkey,
  pickBtcAddress,
  resolveBtcRecipient,
  resolveRegtestBtcRecipient,
} from '../wallet';
import { buildSelfSpendPsbtHex, p2wpkhScript, wshPkScript } from '../wallet-psbt';

export const bitcoinMethods: RpcMethodSpec[] = [
  // ── sendTransfer ──────────────────────────────────────────────────────────
  {
    id: 'sendTransfer-single',
    method: 'sendTransfer',
    label: 'sendTransfer (1 recipient)',
    category: 'Bitcoin',
    description:
      '1,000 sats on mainnet to your own native-segwit address (getAddresses prompt) — or to VITE_TEST_APP_BTC_RECIPIENT if set. Approving on a funded wallet broadcasts a real transaction; only the fee leaves.',
    async params(ctx) {
      return {
        recipients: [{ address: await resolveBtcRecipient(ctx), amount: '1000' }],
        network: 'mainnet',
      } satisfies ParamsOf<'sendTransfer'>;
    },
  },
  {
    id: 'sendTransfer-batch',
    method: 'sendTransfer',
    label: 'sendTransfer (batch)',
    category: 'Bitcoin',
    description:
      'Batched mainnet send to your own native-segwit (or VITE_TEST_APP_BTC_RECIPIENT) + your own taproot address.',
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
        network: 'mainnet',
      } satisfies ParamsOf<'sendTransfer'>;
    },
  },
  {
    id: 'sendTransfer-private',
    method: 'sendTransfer',
    label: 'sendTransfer (private)',
    category: 'Bitcoin',
    description:
      '10,000 sats on the private (regtest) network to your own bcrt1… address — or VITE_TEST_APP_BTC_RECIPIENT_REGTEST. Succeeds end-to-end if the wallet has regtest funds.',
    async params(ctx) {
      return {
        recipients: [{ address: await resolveRegtestBtcRecipient(ctx), amount: '10000' }],
        network: 'private',
      } satisfies ParamsOf<'sendTransfer'>;
    },
  },
  {
    id: 'sendTransfer-no-broadcast',
    method: 'sendTransfer',
    label: 'sendTransfer (broadcast: false)',
    category: 'Bitcoin',
    description:
      'Same regtest transfer, but the wallet signs WITHOUT broadcasting. Response is { transaction } (raw signed tx hex) with no txid.',
    async params(ctx) {
      return {
        recipients: [{ address: await resolveRegtestBtcRecipient(ctx), amount: '10000' }],
        network: 'private',
        broadcast: false,
      } satisfies ParamsOf<'sendTransfer'>;
    },
  },

  // ── signPsbt ──────────────────────────────────────────────────────────────
  {
    id: 'signPsbt',
    method: 'signPsbt',
    label: 'signPsbt',
    category: 'Bitcoin',
    description:
      'Reads your native-segwit key (getAddresses prompt), then asks to sign a PSBT spending a fictitious outpoint at that address back to itself. The wallet owns the key, so it signs and returns { hex }.',
    async params(ctx) {
      const lock = p2wpkhScript(await fetchNativeSegwitPubkey(ctx));
      return { hex: buildSelfSpendPsbtHex(lock), broadcast: false } satisfies ParamsOf<'signPsbt'>;
    },
  },
  {
    id: 'signPsbt-broadcast',
    method: 'signPsbt',
    label: 'signPsbt (broadcast)',
    category: 'Bitcoin',
    description:
      'Same PSBT with broadcast: true. Signing succeeds; the broadcast is expected to fail because the outpoint does not exist.',
    async params(ctx) {
      const lock = p2wpkhScript(await fetchNativeSegwitPubkey(ctx));
      return { hex: buildSelfSpendPsbtHex(lock), broadcast: true } satisfies ParamsOf<'signPsbt'>;
    },
  },
  {
    id: 'signPsbt-signAtIndex',
    method: 'signPsbt',
    label: 'signPsbt (signAtIndex)',
    category: 'Bitcoin',
    description:
      'Two inputs at your address, signAtIndex: [0] — only input 0 should come back with a partial signature.',
    async params(ctx) {
      const lock = p2wpkhScript(await fetchNativeSegwitPubkey(ctx));
      return {
        hex: buildSelfSpendPsbtHex(lock, { inputs: 2 }),
        signAtIndex: [0],
        broadcast: false,
      } satisfies ParamsOf<'signPsbt'>;
    },
  },
  {
    id: 'signPsbt-descriptor',
    method: 'signPsbt',
    label: 'signPsbt (descriptor)',
    category: 'Bitcoin',
    description:
      'Custom P2WSH input: wsh(pk(<your native-segwit key>)). The BIP-380 `descriptor` tells the wallet which key signs a script it does not otherwise recognise.',
    async params(ctx) {
      const lock = wshPkScript(await fetchNativeSegwitPubkey(ctx));
      return {
        hex: buildSelfSpendPsbtHex(lock),
        descriptor: lock.descriptor,
        broadcast: false,
      } satisfies ParamsOf<'signPsbt'>;
    },
  },
  {
    id: 'signPsbt-sighash',
    method: 'signPsbt',
    label: 'signPsbt (custom sighash)',
    category: 'Bitcoin',
    description:
      'SINGLE | ANYONECANPAY (0x83) — set on the input via PSBT_IN_SIGHASH_TYPE and whitelisted through allowedSighash. The wallet refuses if either is missing.',
    async params(ctx) {
      const lock = p2wpkhScript(await fetchNativeSegwitPubkey(ctx));
      return {
        hex: buildSelfSpendPsbtHex(lock, { sighashType: SIGHASH.SINGLE_ANYONECANPAY }),
        allowedSighash: [SIGHASH.SINGLE_ANYONECANPAY],
        broadcast: false,
      } satisfies ParamsOf<'signPsbt'>;
    },
  },

  // ── signMessage (BIP-322) ─────────────────────────────────────────────────
  {
    id: 'signMessage-p2wpkh',
    method: 'signMessage',
    label: 'signMessage (p2wpkh)',
    category: 'Bitcoin',
    description: 'BIP-322 sign a message with the native-segwit key.',
    params: {
      message: TEST_MESSAGE,
      paymentType: 'p2wpkh',
      network: 'mainnet',
    } satisfies ParamsOf<'signMessage'>,
  },
  {
    id: 'signMessage-p2tr',
    method: 'signMessage',
    label: 'signMessage (p2tr)',
    category: 'Bitcoin',
    description: 'BIP-322 sign a message with the taproot key.',
    params: {
      message: TEST_MESSAGE,
      paymentType: 'p2tr',
      network: 'mainnet',
    } satisfies ParamsOf<'signMessage'>,
  },
];
