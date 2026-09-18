import { accountIconUrl, defaultAccountIcon, vaultIcons } from './multisig-tokens';

describe('accountIconUrl', () => {
  test('maps every known icon id to its own asset', () => {
    for (const icon of vaultIcons) {
      expect(accountIconUrl(icon)).toBe(`/multisig/icons/account/${icon}.svg`);
    }
  });

  test('maps an unknown icon id to the default asset', () => {
    expect(accountIconUrl('not-an-icon')).toBe(`/multisig/icons/account/${defaultAccountIcon}.svg`);
  });

  test('maps a css url() injection to the default asset', () => {
    const injected = '),url(https://example.com/x';
    expect(accountIconUrl(injected)).toBe(`/multisig/icons/account/${defaultAccountIcon}.svg`);
  });
});
