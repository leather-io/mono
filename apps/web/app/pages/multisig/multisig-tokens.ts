// Foundation constants for the multisig UI that have NO @leather.io/tokens
// equivalent — the genuine TOKEN-GAPs from the U2 value-diff audit (see
// README.md). Everything that DOES have a token match uses the live Panda
// token directly, so the multisig area tracks the current Leather design
// system rather than the prototype's older token snapshot.

interface VaultTheme {
  id: number;
  name: string;
  // Public asset path to the textured hero background (copied from the
  // prototype's ds/themes/ into public/multisig/themes/). Used as a
  // `background` shorthand value on the vault/account/tx hero surfaces.
  background: string;
  // Themes are saturated mid-tones; hero text switches to light for contrast.
  dark: boolean;
}

export const vaultThemes: VaultTheme[] = [
  {
    id: 0,
    name: 'Blue',
    background: "url('/multisig/themes/blue.jpg') center/cover no-repeat",
    dark: true,
  },
  {
    id: 1,
    name: 'Bronze',
    background: "url('/multisig/themes/bronze.jpg') center/cover no-repeat",
    dark: true,
  },
  {
    id: 2,
    name: 'Green',
    background: "url('/multisig/themes/green.jpg') center/cover no-repeat",
    dark: true,
  },
  {
    id: 3,
    name: 'Orange',
    background: "url('/multisig/themes/orange.jpg') center/cover no-repeat",
    dark: true,
  },
];

export function vaultTheme(themeId: number): VaultTheme {
  return vaultThemes[themeId] ?? vaultThemes[0];
}

// Default theme for vaults whose persisted theme is missing or unrecognized.
const fallbackVaultThemeId = 0;

// Theme name stored on the vault (vault.theme) when creating, mapped back to a
// VaultTheme for display. Names are the canonical wire value.
export function vaultThemeName(themeId: number): string {
  return (vaultThemes[themeId] ?? vaultThemes[fallbackVaultThemeId]).name;
}

export function vaultThemeFromName(name: string | null | undefined): VaultTheme {
  return vaultThemes.find(theme => theme.name === name) ?? vaultThemes[fallbackVaultThemeId];
}

// Squircle corner radius for AvatarSq tiles, as a fraction of the tile size, so
// the rounding stays proportional across sizes (a fixed radius reads too round
// on the small tile and too square on the large one). Tuned on the 40px tile,
// where 14px looked right (14 / 40 = 0.35); no token radius matches.
export const avatarSquircleRatio = 0.35;

// Account-icon glyph asset path (mask-image source, recolorable per theme).
export function accountIconUrl(icon: string): string {
  return `/multisig/icons/account/${icon}.svg`;
}
