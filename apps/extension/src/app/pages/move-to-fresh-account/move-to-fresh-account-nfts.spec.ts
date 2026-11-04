import { getNftDisplayName } from './move-to-fresh-account-nfts';

describe(getNftDisplayName.name, () => {
  it('uses the asset name and the token id without the uint prefix', () => {
    expect(
      getNftDisplayName('SP2QEZ06AGJ3RKJPBV14SY1V5BBFNAW33D96YPGZF.BNS-V2::BNS-V2', 'u42')
    ).toBe('BNS-V2 #42');
  });
});
