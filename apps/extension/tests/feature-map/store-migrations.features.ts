import type { ExtensionFeatureEntry } from './extension-feature-entry';

export const storeMigrationsFeatures = [
  {
    id: 'store-migrations',
    anchor: { kind: 'behavior' },
    routes: [],
    params: [],
    entry: [
      {
        kind: 'nav',
        steps: [
          'Open any extension page with a persist:root in chrome.storage.local written by an older version',
          'redux-persist runs the migrations up to the current version before the first render; nothing is shown to the user',
        ],
      },
    ],
    gate: 'none',
    flags: [],
    preconditions: { session: 'signed-out', mocks: ['setupMockApis', 'mockUnhandledRequests'] },
    selectors: { others: [] },
    actions: ['GlobalPage.setupAndUseApiCalls', 'GlobalPage.gotoNakedRoot'],
    specs: ['apps/extension/tests/specs/store-migrations/store-migrations.spec.ts'],
    description:
      'The persisted store is at version 4 (shared/storage/migrations/migrations.ts). The spec starts signed out, writes either a legacy serialized persist:root (the "Migration 0 --> 3" case, which first runs migration 0→1 to deserialize it (migrate-0-1.ts) and then 1→2) or a version 2 object, and reloads with GlobalPage.gotoNakedRoot; the seeded state holds an encrypted software key and no session key, so it reloads as a locked software wallet. Migration 1→2 (migrate-1-2.ts) renames the legacy keys slice to softwareKeys. Migration 2→3 (migrate-2-3.ts) re-keys its "default" entity by the fingerprint read from the STX descriptor (or the Ledger Bitcoin policy), or 00000000 (assumedZeroFingerprint) when the old state has neither, which is the v1 case; the salt moves to softwareKeys.salt and encryptedSecretKey is unchanged. It creates the wallets slice, re-keys chains.stx by fingerprint and points active.account at the migrated account. It deletes onboarding, ordinals and analytics. keychains is built only when the old state had Ledger accounts, and the ledger slice is then deleted; otherwise ledger is simply not persisted (it is not in shared/storage/persist-whitelist.ts) and keychains is the empty initial slice, which is all the spec asserts (toBeDefined). Migration 3→4 (migrate-3-4.ts) creates one accounts entity per derived index and repairs highestAccountIndex: the v2 case with highestAccountIndex 3 ends with accounts ef7bfd66/0 … ef7bfd66/3.',
  },
] as const satisfies readonly ExtensionFeatureEntry[];
