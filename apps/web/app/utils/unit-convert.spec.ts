import { toHumanReadableMicroStx } from './unit-convert';

describe(toHumanReadableMicroStx.name, () => {
  test('it presents numbers correctly according to en-US locale', () => {
    expect(toHumanReadableMicroStx('1000000000001')).toEqual('1,000,000.000001 STX');
    expect(toHumanReadableMicroStx('1')).toEqual('0.000001 STX');
    expect(toHumanReadableMicroStx('100123435')).toEqual('100.123435 STX');
    expect(toHumanReadableMicroStx('9876543210001')).toEqual('9,876,543.210001 STX');
    expect(toHumanReadableMicroStx('111111111111111')).toEqual('111,111,111.111111 STX');
    expect(toHumanReadableMicroStx('9999999999999998')).toEqual('9,999,999,999.999998 STX');
    expect(toHumanReadableMicroStx('9999999999999999')).toEqual('9,999,999,999.999999 STX');
    expect(toHumanReadableMicroStx('999999999999999999998')).toEqual(
      '999,999,999,999,999.999998 STX'
    );
  });
});
