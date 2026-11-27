import {
  accountIconUrl,
  defaultAccountIcon,
  vaultIcons,
  vaultThemeFromName,
} from './multisig-tokens';

describe('vaultThemeFromName', () => {
  test('resolves a lowercase stored theme to the same theme as its display name', () => {
    expect(vaultThemeFromName('green')).toBe(vaultThemeFromName('Green'));
  });
});

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
