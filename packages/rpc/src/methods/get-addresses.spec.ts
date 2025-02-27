import {
  addressResponseBodySchema,
  btcAddressBaseSchema,
  getAddresses,
  stxAddressSchema,
} from './get-addresses';

describe('getAddresses', () => {
  const baseRespnseBodyBtc = {
    symbol: 'BTC',
    type: 'p2wpkh',
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    publicKey: '02d9b4b6e',
    derivationPath: "m/44'/0'/0'/0/0",
  };

  const baseRespnseBodyStx = {
    symbol: 'STX',
    address: 'SP1P72Z370VRYK5V9V3YVQAS1Z4X6D6GKQJ8K2JGK',
    publicKey: '02d9b4b6e',
  };

  describe('btcAddressBaseSchema', () => {
    test('schema mathches test data', () => {
      const result = btcAddressBaseSchema.safeParse(baseRespnseBodyBtc);
      expect(result.success).toEqual(true);
    });

    test('schema allows additional values', () => {
      const result = btcAddressBaseSchema.safeParse({
        ...baseRespnseBodyBtc,
        additionalProperties: 'should not be allowed',
      });
      expect(result.success).toEqual(true);
    });
  });

  describe('stxAddressSchema', () => {
    test('schema allows additional values STX address values', () => {
      const result = stxAddressSchema.safeParse({
        ...baseRespnseBodyStx,
        additionalProperties: 'should not be allowed',
      });
      expect(result.success).toEqual(true);
    });
  });

  describe('getAddressesResponseBody', () => {
    test('schema matches test data', () => {
      const result = addressResponseBodySchema.safeParse({
        addresses: [baseRespnseBodyBtc, baseRespnseBodyStx],
      });
      expect(result.success).toEqual(true);
    });
  });

  test('network being added conditionally', () => {
    const result = getAddresses.params.safeParse({ network: 'testnet' });
    expect(result.success).toEqual(true);
  });

  test('empty params since there is only one prop that is optional', () => {
    const result = getAddresses.params.safeParse({});
    expect(result.success).toEqual(true);
  });
});
