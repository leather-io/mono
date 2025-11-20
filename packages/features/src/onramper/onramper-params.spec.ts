import { describe, expect, it } from 'vitest';

import { getOnramperIframeParams } from './onramper-params';
import { generateSignature } from './utils';

describe('getOnramperIframeParams', () => {
  const baseProps = {
    theme: 'light' as const,
    btcAddress: 'bc1qexample',
    stxAddress: 'SP2C2example',
    apiKey: 'api-key',
    signingSecret: 'secret',
    mode: 'buy' as const,
    successRedirectUrl: 'https://leather.io/success',
    failureRedirectUrl: 'https://leather.io/failure',
  };

  it('includes the expected wallet and network params', () => {
    const params = getOnramperIframeParams({ ...baseProps, redirectAtCheckout: true });

    expect(params.get('wallets')).toBe('btc:bc1qexample,stx_stacks:SP2C2example');
    expect(params.get('onlyCryptoNetworks')).toBe('stacks,bitcoin');
    expect(params.get('signature')).toBe(
      generateSignature('wallets=btc:bc1qexample,stx_stacks:SP2C2example', 'secret')
    );
  });

  it('falls back when only a single address is provided', () => {
    const params = getOnramperIframeParams({
      ...baseProps,
      btcAddress: undefined,
      redirectAtCheckout: false,
    });

    expect(params.get('wallets')).toBe('stx_stacks:SP2C2example');
    expect(params.get('onlyCryptoNetworks')).toBe('stacks');
    expect(params.get('redirectAtCheckout')).toBe('false');
  });
});
