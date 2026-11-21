import { describe, expect, test } from 'vitest';

import { descriptorKeyPath } from './descriptor-key-path.kernel';

describe('descriptorKeyPath', () => {
  test('is a slash, the change index, a slash and the address index', () => {
    expect(descriptorKeyPath.print({ changeIndex: 1, addressIndex: 7 })).toBe('/1/7');
    expect(descriptorKeyPath.parse('/0/12')).toEqual({ changeIndex: 0, addressIndex: 12 });
    expect(() => descriptorKeyPath.parse('/2/0')).toThrowError(RangeError);
  });
});
