import {
  addressResponseBodySchema,
  btcAddressBaseSchema,
  btcAddressSchema,
  getAddresses,
  singleSigAddressResponseBodySchema,
  stxAddressSchema,
} from './get-addresses';

describe('getAddresses', () => {
  const baseRespnseBodyBtc = {
    symbol: 'BTC',
    type: 'p2wpkh',
    address: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    publicKey: '02d9b4b6e',
    derivationPath: "m/44'/0'/0'/0/0",
    descriptor: 'wpkh(testing-xpub)',
    fingerprint: 'e87a850b',
  };

  const baseRespnseBodyStx = {
    symbol: 'STX',
    kind: 'single-sig',
    address: 'SP1P72Z370VRYK5V9V3YVQAS1Z4X6D6GKQJ8K2JGK',
    publicKey: '02d9b4b6e',
  };

  const policyBtcAddress = {
    symbol: 'BTC',
    type: 'p2wsh',
    address: 'bc1qexamplemultisigaddressxyz',
    descriptor: 'wsh(sortedmulti(2,02aa,02bb))#checksum0',
  };

  const multisigStxAddress = {
    symbol: 'STX',
    kind: 'multisig',
    address: 'SM3CFXKD81GREH6MYFW4P9VKSSR2N525W3KDRH3P1',
    threshold: 2,
    publicKeys: ['02aa', '03bb'],
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

    test('schema requires a fingerprint', () => {
      const result = btcAddressBaseSchema.safeParse({
        symbol: baseRespnseBodyBtc.symbol,
        type: baseRespnseBodyBtc.type,
        address: baseRespnseBodyBtc.address,
        publicKey: baseRespnseBodyBtc.publicKey,
        derivationPath: baseRespnseBodyBtc.derivationPath,
        descriptor: baseRespnseBodyBtc.descriptor,
      });
      expect(result.success).toEqual(false);
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

    test('parses a multisig STX address', () => {
      const result = stxAddressSchema.safeParse(multisigStxAddress);
      expect(result.success).toEqual(true);
    });

    test('rejects a single-sig STX address missing kind', () => {
      const result = stxAddressSchema.safeParse({
        symbol: baseRespnseBodyStx.symbol,
        address: baseRespnseBodyStx.address,
        publicKey: baseRespnseBodyStx.publicKey,
      });
      expect(result.success).toEqual(false);
    });
  });

  describe('btcPolicyAddressSchema', () => {
    test('parses a p2wsh policy address', () => {
      const result = btcAddressSchema.safeParse(policyBtcAddress);
      expect(result.success).toEqual(true);
    });
  });

  describe('getAddressesResponseBody', () => {
    test('schema matches test data', () => {
      const result = addressResponseBodySchema.safeParse({
        addresses: [baseRespnseBodyBtc, baseRespnseBodyStx, policyBtcAddress, multisigStxAddress],
      });
      expect(result.success).toEqual(true);
    });
  });

  describe('singleSigAddressResponseBodySchema', () => {
    test('accepts single-sig BTC and STX addresses', () => {
      const result = singleSigAddressResponseBodySchema.safeParse({
        addresses: [baseRespnseBodyBtc, baseRespnseBodyStx],
      });
      expect(result.success).toEqual(true);
    });

    test('rejects a p2wsh policy BTC address', () => {
      const result = singleSigAddressResponseBodySchema.safeParse({
        addresses: [baseRespnseBodyBtc, policyBtcAddress],
      });
      expect(result.success).toEqual(false);
    });

    test('rejects a multisig STX address', () => {
      const result = singleSigAddressResponseBodySchema.safeParse({
        addresses: [baseRespnseBodyStx, multisigStxAddress],
      });
      expect(result.success).toEqual(false);
    });
  });

  test('network being added conditionally', () => {
    const result = getAddresses.params.safeParse({ network: 'testnet' });
    expect(result.success).toEqual(true);
  });

  test('allowPolicyAccounts flag is accepted', () => {
    const result = getAddresses.params.safeParse({ allowPolicyAccounts: true });
    expect(result.success).toEqual(true);
  });

  test('empty params since there is only one prop that is optional', () => {
    const result = getAddresses.params.safeParse({});
    expect(result.success).toEqual(true);
  });
});
