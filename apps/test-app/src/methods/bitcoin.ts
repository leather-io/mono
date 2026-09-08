// Singlesig Bitcoin requests: transfers, PSBT signing, BIP-322 message signing.
//
// Transfers default to sending to the CONNECTED wallet's own address and the
// signPsbt entry builds its PSBT from its own keys (one extra getAddresses
// prompt each), so they work on any Leather install.
import { collectPsbtKeys } from '../builders/keys';
import { buildPsbtScenario } from '../builders/psbt';
import { TEST_MESSAGE } from '../constants';
import { type ParamsOf, type RpcMethodSpec, networkOf } from '../types';
import { verifySignedPsbt } from '../verifiers/spec-verifiers';
import { resolveBtcRecipient } from '../wallet';

export const bitcoinMethods: RpcMethodSpec[] = [
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
];
