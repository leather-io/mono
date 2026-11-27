import { describe, expect, it } from 'vitest';

import { getOnramperIframeParams } from './onramper-params';

describe('getOnramperIframeParams', () => {
  const baseProps = {
    theme: 'light' as const,
    btcAddress: 'bc1qexample',
    stxAddress: 'SP2C2example',
    apiKey: 'api-key',
    mode: 'buy' as const,
    successRedirectUrl: 'https://leather.io/success',
    failureRedirectUrl: 'https://leather.io/failure',
  };

  it('includes the expected wallet and network params', () => {
    const params = getOnramperIframeParams({ ...baseProps, redirectAtCheckout: true });

    expect(params['wallets']).toBe('btc:bc1qexample,stx_stacks:SP2C2example');
    expect(params['onlyCryptoNetworks']).toBe('stacks,bitcoin');
  });

  it('leaves the signature to the signing service', () => {
    const params = getOnramperIframeParams({ ...baseProps, redirectAtCheckout: true });

    expect(params).not.toHaveProperty('signature');
  });

  it('includes the platform when one is given', () => {
    const params = getOnramperIframeParams({
      ...baseProps,
      redirectAtCheckout: true,
      platform: 'browser-extension',
    });

    expect(params['platform']).toBe('browser-extension');
  });

  it('omits the platform when none is given', () => {
    const params = getOnramperIframeParams({ ...baseProps, redirectAtCheckout: true });

    expect(params).not.toHaveProperty('platform');
  });

  it('falls back when only a single address is provided', () => {
    const params = getOnramperIframeParams({
      ...baseProps,
      btcAddress: undefined,
      redirectAtCheckout: false,
    });

    expect(params['wallets']).toBe('stx_stacks:SP2C2example');
    expect(params['onlyCryptoNetworks']).toBe('stacks');
    expect(params['redirectAtCheckout']).toBe('false');
  });
});
