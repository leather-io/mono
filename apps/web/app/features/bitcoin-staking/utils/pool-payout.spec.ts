import {
  canPayoutInBtc,
  getPoolPayoutMode,
  getRewardsTokenLabel,
  getRewardsTokenSymbol,
  isBtcPayoutRequired,
} from './pool-payout';

describe(getPoolPayoutMode.name, () => {
  test('is sbtc for a pool without BTC payout', () => {
    expect(getPoolPayoutMode({ supportsBtcPayout: false })).toBe('sbtc');
  });

  test('is sbtc-or-btc for a reference pool with the L1 payout preference', () => {
    expect(getPoolPayoutMode({ supportsBtcPayout: true })).toBe('sbtc-or-btc');
  });

  test('is btc-only for a pool whose operator pays native BTC off chain', () => {
    expect(
      getPoolPayoutMode({ supportsBtcPayout: true, operatorBtcPayout: { cadence: 'monthly' } })
    ).toBe('btc-only');
  });
});

describe('payout mode helpers', () => {
  test('only btc-only requires a BTC address', () => {
    expect(isBtcPayoutRequired('btc-only')).toBe(true);
    expect(isBtcPayoutRequired('sbtc-or-btc')).toBe(false);
    expect(isBtcPayoutRequired('sbtc')).toBe(false);
  });

  test('sbtc is the only mode that cannot pay out in BTC', () => {
    expect(canPayoutInBtc('sbtc')).toBe(false);
    expect(canPayoutInBtc('sbtc-or-btc')).toBe(true);
    expect(canPayoutInBtc('btc-only')).toBe(true);
  });

  test('labels and symbols follow the mode', () => {
    expect(getRewardsTokenLabel('sbtc')).toBe('sBTC');
    expect(getRewardsTokenLabel('sbtc-or-btc')).toBe('sBTC / BTC');
    expect(getRewardsTokenLabel('btc-only')).toBe('BTC');
    expect(getRewardsTokenSymbol('btc-only')).toBe('BTC');
    expect(getRewardsTokenSymbol('sbtc-or-btc')).toBe('sBTC');
  });
});
