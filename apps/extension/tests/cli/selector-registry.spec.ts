import { resolveReadyTarget, selectorRegistry } from './selector-registry';
import { VerifyUsageError } from './verify-errors';

describe('resolveReadyTarget', () => {
  test('passes a literal test id through', () => {
    expect(resolveReadyTarget('send-page-ready')).toEqual({
      target: 'send-page-ready',
      testId: 'send-page-ready',
    });
  });

  test('resolves a selector member through the registry', () => {
    expect(resolveReadyTarget('SendCryptoAssetSelectors.SendPageReady')).toEqual({
      target: 'SendCryptoAssetSelectors.SendPageReady',
      testId: selectorRegistry.SendCryptoAssetSelectors.SendPageReady,
    });
  });

  test('rejects an unknown group', () => {
    expect(() => resolveReadyTarget('HomeSelectors.HomePageContainer')).toThrow(VerifyUsageError);
  });

  test('rejects an unknown member', () => {
    expect(() => resolveReadyTarget('HomePageSelectors.Missing')).toThrow(/Known members/);
  });
});
