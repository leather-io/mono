import { serializeKeyOrigin } from './bitcoin-payer';

describe(serializeKeyOrigin.name, () => {
  test('that is turns @scure/btc-signer format derivation path into key origin', () => {
    const test = {
      fingerprint: 3621349508,
      path: [2147483732, 2147483648, 2147483648, 0, 0],
    };
    expect(serializeKeyOrigin(test)).toEqual("d7d96884/84'/0'/0'/0/0");
  });

  test('that it correctly handles fingerprints with leading zeros', () => {
    const testWithLeadingZero = {
      fingerprint: 51208947,
      path: [2147483732, 2147483648, 2147483648, 0, 0],
    };
    const result = serializeKeyOrigin(testWithLeadingZero);
    expect(result.split('/')[0].length).toEqual(8);
    expect(result).toContain("/84'/0'/0'/0/0");
  });
});
