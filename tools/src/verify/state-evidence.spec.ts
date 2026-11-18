import { describe, expect, test } from 'vitest';

import {
  buildStateEvidence,
  hasEncryptionKey,
  redactSoftwareKeys,
  redactedValue,
  selectSlices,
} from './state-evidence.js';

const secretKeyHex = 'ff735c244c72e1c7ff735c244c72e1c7';
const saltHex = 'a086b877fc757a4daa7c6343d2861c05';
const sessionKeyHex = 'd904f412d904f412d904f412';

const softwareKeys = {
  salt: saltHex,
  ids: ['e87a850b'],
  entities: {
    e87a850b: { type: 'software', id: 'e87a850b', encryptedSecretKey: secretKeyHex },
  },
};

const store = {
  active: { account: { fingerprint: 'e87a850b', accountIndex: 0 } },
  wallets: { ids: ['e87a850b'], entities: { e87a850b: { name: 'Wallet 1' } } },
  softwareKeys,
  settings: { userSelectedTheme: 'system' },
};

describe(redactSoftwareKeys.name, () => {
  test('replaces the salt and every nested encrypted secret key', () => {
    expect(redactSoftwareKeys(softwareKeys)).toEqual({
      salt: redactedValue,
      ids: ['e87a850b'],
      entities: {
        e87a850b: { type: 'software', id: 'e87a850b', encryptedSecretKey: redactedValue },
      },
    });
    expect(redactSoftwareKeys([{ encryptedSecretKey: 'x' }])).toEqual([
      { encryptedSecretKey: redactedValue },
    ]);
    expect(redactSoftwareKeys('plain')).toBe('plain');
  });
});

describe(selectSlices.name, () => {
  test('keeps only the requested slices and nulls the missing ones', () => {
    expect(selectSlices(store, ['active', 'networks'])).toEqual({
      active: { account: { fingerprint: 'e87a850b', accountIndex: 0 } },
      networks: null,
    });
    expect(selectSlices(undefined, ['active'])).toEqual({ active: null });
  });
});

describe(hasEncryptionKey.name, () => {
  test('reports presence without the value', () => {
    expect(hasEncryptionKey({ encryptionKey: sessionKeyHex })).toBe(true);
    expect(hasEncryptionKey({ encryptionKey: '' })).toBe(false);
    expect(hasEncryptionKey({})).toBe(false);
    expect(hasEncryptionKey(undefined)).toBe(false);
  });
});

describe(buildStateEvidence.name, () => {
  test('never lets an encrypted secret key, the salt or the session key reach the output', () => {
    const evidence = buildStateEvidence(store, ['active', 'softwareKeys', 'settings'], {
      encryptionKey: sessionKeyHex,
    });
    const serialized = JSON.stringify(evidence);
    expect(serialized).not.toContain(secretKeyHex);
    expect(serialized).not.toContain(saltHex);
    expect(serialized).not.toContain(sessionKeyHex);
    expect(evidence.session).toEqual({ encryptionKeyPresent: true });
    expect(evidence.slices).toEqual({
      active: store.active,
      softwareKeys: {
        salt: redactedValue,
        ids: ['e87a850b'],
        entities: {
          e87a850b: { type: 'software', id: 'e87a850b', encryptedSecretKey: redactedValue },
        },
      },
      settings: { userSelectedTheme: 'system' },
    });
  });
});
