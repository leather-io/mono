import { RouteUrls } from '@shared/route-urls';

import { replaceRouteParams } from './replace-route-params';

describe(replaceRouteParams.name, () => {
  it('replaces a required param', () => {
    expect(
      replaceRouteParams('/swap/stacks/:base/:quote/review', { base: 'STX', quote: 'BTC' })
    ).toEqual('/swap/stacks/STX/BTC/review');
  });

  it('replaces an optional param without leaving its marker behind', () => {
    expect(replaceRouteParams(RouteUrls.Swap, { base: 'STX', quote: 'BTC' })).toEqual(
      '/swap/{chain}/STX/BTC'
    );
  });

  it('drops an optional segment given an empty value', () => {
    expect(replaceRouteParams(RouteUrls.Swap, { base: 'STX', quote: '' })).toEqual(
      '/swap/{chain}/STX'
    );
  });

  it('drops an optional segment given an undefined value', () => {
    expect(replaceRouteParams(RouteUrls.Swap, { base: 'STX', quote: undefined })).toEqual(
      '/swap/{chain}/STX'
    );
  });

  it('leaves token symbols unencoded', () => {
    expect(replaceRouteParams(RouteUrls.Swap, { base: 'aeUSDC', quote: 'sBTC' })).toEqual(
      '/swap/{chain}/aeUSDC/sBTC'
    );
  });

  it('encodes a value that would otherwise start a query string', () => {
    const path = replaceRouteParams(RouteUrls.Swap, {
      base: 'STX?origin=https%3A%2F%2Fapp.leather.io&accountIndex=9&network=testnet&pad=',
      quote: 'BTC',
    });

    expect(path).toEqual(
      '/swap/{chain}/STX%3Forigin%3Dhttps%253A%252F%252Fapp.leather.io%26accountIndex%3D9%26network%3Dtestnet%26pad%3D/BTC'
    );
    expect(
      new URLSearchParams(`popup.html#${path}?requestId=1`.split('?')[1]).get('origin')
    ).toBeNull();
  });

  it('encodes a value that would otherwise add path segments', () => {
    expect(replaceRouteParams(RouteUrls.Swap, { base: '../../onboarding', quote: 'BTC' })).toEqual(
      '/swap/{chain}/..%2F..%2Fonboarding/BTC'
    );
  });

  it('encodes a value that would otherwise inject another route placeholder', () => {
    expect(replaceRouteParams('/swap/{chain}/:base', { base: '{chain}' })).toEqual(
      '/swap/{chain}/%7Bchain%7D'
    );
  });

  it('encodes a serialized asset id into a single decodable segment', () => {
    const path = replaceRouteParams(RouteUrls.Swap, {
      base: 'STX',
      quote: 'sip10|SP1.sbtc-token::sbtc-token',
    });

    expect(path).toEqual('/swap/{chain}/STX/sip10%7CSP1.sbtc-token%3A%3Asbtc-token');
    expect(decodeURIComponent(path.split('/')[4])).toEqual('sip10|SP1.sbtc-token::sbtc-token');
  });

  it('replaces numeric values', () => {
    expect(replaceRouteParams('/accounts/:index', { index: 4 })).toEqual('/accounts/4');
  });
});
