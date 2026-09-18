import { generateRandomHexString } from './generate-random-hex';

describe(generateRandomHexString.name, () => {
  test('preserves the 16-byte default', () => {
    expect(generateRandomHexString()).toMatch(/^[0-9a-f]{32}$/);
  });

  test('generates an exact 48-byte wallet encryption key', () => {
    const first = generateRandomHexString(48);
    const second = generateRandomHexString(48);

    expect(first).toMatch(/^[0-9a-f]{96}$/);
    expect(second).toMatch(/^[0-9a-f]{96}$/);
    expect(first).not.toBe(second);
  });
});
