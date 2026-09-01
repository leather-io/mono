import { parseSwitchTargetSlug } from './switch-target';

describe(parseSwitchTargetSlug.name, () => {
  test('returns the slug for a valid, available, non-current pool', () => {
    expect(
      parseSwitchTargetSlug({
        search: '?to=fast-pool',
        currentProviderId: 'stackingDao',
        networkMode: 'mainnet',
      })
    ).toBe('fast-pool');
  });

  test('accepts a search string that also carries other params', () => {
    expect(
      parseSwitchTargetSlug({
        search: '?contract=SP21YTSM60CAY6D011EZVEVNKXVW8FVZE198XEFFP.custom&to=xverse-pool',
        currentProviderId: 'byosm',
        networkMode: 'mainnet',
      })
    ).toBe('xverse-pool');
  });

  test('ignores a missing or unknown slug', () => {
    expect(
      parseSwitchTargetSlug({
        search: '',
        currentProviderId: 'stackingDao',
        networkMode: 'mainnet',
      })
    ).toBeNull();
    expect(
      parseSwitchTargetSlug({
        search: '?to=not-a-pool',
        currentProviderId: 'stackingDao',
        networkMode: 'mainnet',
      })
    ).toBeNull();
  });

  test('ignores byosm as a target', () => {
    expect(
      parseSwitchTargetSlug({
        search: '?to=byosm',
        currentProviderId: 'stackingDao',
        networkMode: 'mainnet',
      })
    ).toBeNull();
  });

  test('ignores the current pool as a target', () => {
    expect(
      parseSwitchTargetSlug({
        search: '?to=stacking-dao',
        currentProviderId: 'stackingDao',
        networkMode: 'mainnet',
      })
    ).toBeNull();
  });

  test('ignores a pool without signer-manager contracts on the network', () => {
    expect(
      parseSwitchTargetSlug({
        search: '?to=planbetter',
        currentProviderId: 'stackingDao',
        networkMode: 'mainnet',
      })
    ).toBeNull();
    expect(
      parseSwitchTargetSlug({
        search: '?to=fast-pool',
        currentProviderId: 'stackingDao',
        networkMode: 'devnet',
      })
    ).toBeNull();
  });
});
