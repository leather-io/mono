import { validateRpcSignMessageParams } from './sign-message';

describe('`signMessage` method', () => {
  describe('schema validation', () => {
    test('that it validates a default network id', () => {
      expect(validateRpcSignMessageParams({ message: 'hello', network: 'mainnet' })).toEqual(true);
    });

    test('that it accepts custom non-default network ids', () => {
      expect(validateRpcSignMessageParams({ message: 'hello', network: 'private' })).toEqual(true);
    });

    test('that it validates without a network', () => {
      expect(validateRpcSignMessageParams({ message: 'hello' })).toEqual(true);
    });

    test('that it fails when the message is missing', () => {
      expect(validateRpcSignMessageParams({ network: 'mainnet' })).toEqual(false);
    });
  });
});
