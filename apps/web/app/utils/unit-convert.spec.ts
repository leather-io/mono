import { toHumanReadableStx } from './unit-convert';

describe(toHumanReadableStx.name, () => {
  test('it presents numbers correctly according to en-US locale', () => {
    expect(toHumanReadableStx('1000000000001')).toEqual('1,000,000.000001 STX');
    expect(toHumanReadableStx('1')).toEqual('0.000001 STX');
    expect(toHumanReadableStx('100123435')).toEqual('100.123435 STX');
    expect(toHumanReadableStx('9876543210001')).toEqual('9,876,543.210001 STX');
    expect(toHumanReadableStx('111111111111111')).toEqual('111,111,111.111111 STX');
    expect(toHumanReadableStx('9999999999999998')).toEqual('9,999,999,999.999998 STX');
    expect(toHumanReadableStx('9999999999999999')).toEqual('9,999,999,999.999999 STX');
    expect(toHumanReadableStx('999999999999999999998')).toEqual('999,999,999,999,999.999998 STX');
  });
});
