import { redactSoftwareKeys, redactedValue, selectSlices } from './state-evidence';

const softwareKeys = {
  salt: 'a086b877fc757a4daa7c6343d2861c05',
  ids: ['e87a850b'],
  entities: {
    e87a850b: { type: 'software', id: 'e87a850b', encryptedSecretKey: 'ff735c244c72e1c7' },
  },
};

describe('redactSoftwareKeys', () => {
  test('replaces the salt and every encrypted secret key', () => {
    expect(redactSoftwareKeys(softwareKeys)).toEqual({
      salt: redactedValue,
      ids: ['e87a850b'],
      entities: {
        e87a850b: { type: 'software', id: 'e87a850b', encryptedSecretKey: redactedValue },
      },
    });
  });

  test('leaves primitives untouched', () => {
    expect(redactSoftwareKeys('plain')).toBe('plain');
  });
});

describe('selectSlices', () => {
  test('picks the requested slices and nulls the missing ones', () => {
    const store = { active: { account: null }, softwareKeys };
    expect(selectSlices(store, ['active', 'wallets', 'softwareKeys'])).toEqual({
      active: { account: null },
      wallets: null,
      softwareKeys: {
        salt: redactedValue,
        ids: ['e87a850b'],
        entities: {
          e87a850b: { type: 'software', id: 'e87a850b', encryptedSecretKey: redactedValue },
        },
      },
    });
  });

  test('nulls every slice when nothing is persisted', () => {
    expect(selectSlices(undefined, ['active'])).toEqual({ active: null });
  });
});
