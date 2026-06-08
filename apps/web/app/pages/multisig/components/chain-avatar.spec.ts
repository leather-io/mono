import { chainToAvatarAsset } from './chain-avatar';

describe('chainToAvatarAsset', () => {
  test('maps btc to the native bitcoin asset', () => {
    expect(chainToAvatarAsset('btc')).toEqual({ protocol: 'nativeBtc' });
  });

  test('maps stx to the native stacks asset', () => {
    expect(chainToAvatarAsset('stx')).toEqual({ protocol: 'nativeStx' });
  });
});
