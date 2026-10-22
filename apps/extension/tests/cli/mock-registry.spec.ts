import { mockNames, parseMocksSpec } from './mock-registry';
import { VerifyUsageError } from './verify-errors';

describe('parseMocksSpec', () => {
  test('parses the default and none modes', () => {
    expect(parseMocksSpec('default')).toEqual({ mode: 'default', extras: [] });
    expect(parseMocksSpec('none')).toEqual({ mode: 'none', extras: [] });
  });

  test('parses extra mocks after the default mode', () => {
    expect(
      parseMocksSpec('default,+mockBnsV2NamesRequest, +mockEmptyStacksBalancesRequest')
    ).toEqual({
      mode: 'default',
      extras: ['mockBnsV2NamesRequest', 'mockEmptyStacksBalancesRequest'],
    });
  });

  test('rejects unknown modes, extras without a plus and unknown names', () => {
    expect(() => parseMocksSpec('all')).toThrow(VerifyUsageError);
    expect(() => parseMocksSpec('default,mockBnsV2NamesRequest')).toThrow(/must start with/);
    expect(() => parseMocksSpec('default,+mockNothing')).toThrow(mockNames[0]);
  });

  test('rejects extras with the none mode', () => {
    expect(() => parseMocksSpec('none,+mockBnsV2NamesRequest')).toThrow(VerifyUsageError);
  });
});
