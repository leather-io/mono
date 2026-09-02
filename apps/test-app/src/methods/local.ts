// Scratch catalog: your own experiments, kept out of the shared files.
//
// This file is committed EMPTY on purpose so `tsc`, vitest and Playwright can
// all resolve it. To keep your edits out of commits:
//
//     git update-index --skip-worktree apps/test-app/src/methods/local.ts
//
// (and `--no-skip-worktree` when you actually want to share something).
//
// Everything the shared catalogs use is available here: `ctx` for wallet
// reads, the builders under ../builders, the verifiers under ../verifiers.
import type { RpcMethodSpec } from '../types';

export const localMethods: RpcMethodSpec[] = [
  // {
  //   id: 'scratch',
  //   method: 'signPsbt',
  //   label: 'scratch',
  //   category: 'Local',
  //   description: 'Whatever you are debugging right now.',
  //   async params(ctx) {
  //     const keys = await collectPsbtKeys(ctx, ['p2wpkh']);
  //     const { psbtHex } = buildPsbtScenario({ inputs: [{ kind: 'p2wpkh' }] }, keys);
  //     return { hex: psbtHex, broadcast: false };
  //   },
  //   verify: verifySignedPsbt({ signedIndexes: [0] }),
  // },
];
