// The sighash cases that are NOT points in a product, and so stay listed: a
// PSBT with no flag at all, and PSBTs carrying different flags on different
// inputs. Everything that varies one flag at a time is a selection in the
// signPsbt builder — see ./psbt-builder.
import { collectPsbtKeys } from '../builders/keys';
import { buildPsbtScenario } from '../builders/psbt';
import { SIGHASH } from '../constants';
import type { ParamsOf, RpcMethodSpec } from '../types';
import { verifySignedPsbt } from '../verifiers/spec-verifiers';

export const sighashMethods: RpcMethodSpec[] = [
  {
    id: 'sighash-no-flag',
    method: 'signPsbt',
    label: 'p2wpkh · no flag set',
    category: 'Sighash',
    description:
      'PSBT_IN_SIGHASH_TYPE absent. The signer falls back to its default (ALL for segwit v0), so the signature must come back stamped ALL and must break on any change.',
    async params(ctx) {
      const keys = await collectPsbtKeys(ctx, ['p2wpkh']);
      const { psbtHex } = buildPsbtScenario(
        {
          inputs: [{ kind: 'p2wpkh' }],
          outputs: [{ kind: 'self', amount: 40_000n }, { kind: 'self' }],
        },
        keys
      );
      return { hex: psbtHex, broadcast: false } satisfies ParamsOf<'signPsbt'>;
    },
    expect: 'success',
    requires: ['singlesig'],
    tags: ['sighash', 'ci'],
    verify: verifySignedPsbt({ sighash: SIGHASH.ALL, signedIndexes: [0], semantics: true }),
  },
  {
    id: 'sighash-mixed-inputs',
    method: 'signPsbt',
    label: 'p2wpkh · mixed flags across inputs',
    category: 'Sighash',
    description:
      'Input 0 is ALL, input 1 is SINGLE|ANYONECANPAY. Each signature must carry its own input’s flag — a wallet that applies one flag to the whole request fails here.',
    async params(ctx) {
      const keys = await collectPsbtKeys(ctx, ['p2wpkh']);
      const { psbtHex } = buildPsbtScenario(
        {
          inputs: [
            { kind: 'p2wpkh', sighash: SIGHASH.ALL },
            { kind: 'p2wpkh', sighash: SIGHASH.SINGLE_ANYONECANPAY },
          ],
          outputs: [{ kind: 'self', amount: 40_000n }, { kind: 'self' }],
        },
        keys
      );
      return {
        hex: psbtHex,
        allowedSighash: [SIGHASH.ALL, SIGHASH.SINGLE_ANYONECANPAY],
        broadcast: false,
      } satisfies ParamsOf<'signPsbt'>;
    },
    expect: 'success',
    requires: ['singlesig'],
    tags: ['sighash', 'ci'],
    verify: verifySignedPsbt({ signedIndexes: [0, 1], semantics: true }),
  },
  {
    id: 'sighash-signAtIndex-mixed',
    method: 'signPsbt',
    label: 'p2wpkh · mixed flags, signAtIndex [1]',
    category: 'Sighash',
    description:
      'Same mixed-flag PSBT, but only input 1 (SINGLE|ANYONECANPAY) is requested. Input 0 must come back untouched.',
    async params(ctx) {
      const keys = await collectPsbtKeys(ctx, ['p2wpkh']);
      const { psbtHex } = buildPsbtScenario(
        {
          inputs: [
            { kind: 'p2wpkh', sighash: SIGHASH.ALL },
            { kind: 'p2wpkh', sighash: SIGHASH.SINGLE_ANYONECANPAY },
          ],
          outputs: [{ kind: 'self', amount: 40_000n }, { kind: 'self' }],
        },
        keys
      );
      return {
        hex: psbtHex,
        signAtIndex: [1],
        allowedSighash: [SIGHASH.SINGLE_ANYONECANPAY],
        broadcast: false,
      } satisfies ParamsOf<'signPsbt'>;
    },
    expect: 'success',
    requires: ['singlesig'],
    tags: ['sighash', 'ci'],
    verify: verifySignedPsbt({ signedIndexes: [1], sighash: SIGHASH.SINGLE_ANYONECANPAY }),
  },
];
