// Foundation constants for the multisig UI that have NO @leather.io/tokens
// equivalent — the genuine TOKEN-GAPs from the U2 value-diff audit (see
// README.md). Everything that DOES have a token match uses the live Panda
// token directly, so the multisig area tracks the current Leather design
// system rather than the prototype's older token snapshot.

// Bitcoin brand orange. `stacks` exists as a Panda color token (#5546FF) and
// is referenced directly as the `stacks` token; bitcoin has no token, so the
// raw hex lives here and is passed as a literal value to style props.
export const bitcoinColor = '#F7931A';

// Chain accent usable in Panda style props. `stacks` is a token name (resolves
// to the Panda color token); `btc` is a raw hex literal. Both are valid values
// for a `color`/`bg` style prop.
export const chainColor = {
  stx: 'stacks',
  btc: bitcoinColor,
};

export interface VaultTheme {
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

// Squircle radius for AvatarSq tiles — the prototype uses a soft-rounded
// square; no token radius matches (tokens stop at lg = 12px / round).
export const avatarSquircleRadius = '14px';

// Account-icon glyph asset path (mask-image source, recolorable per theme).
export function accountIconUrl(icon: string): string {
  return `/multisig/icons/account/${icon}.svg`;
}

// The account glyphs offered in the Create Account icon picker (filenames in
// public/multisig/icons/account/). `vault` is excluded — it's reserved for the
// vault avatar itself.
export const accountIcons = [
  'piggybank',
  'sparkles',
  'orange',
  'pizza',
  'car',
  'alien',
  'saturn',
  'bank',
  'rocket',
  'folder',
  'smile',
  'code',
  'zap',
  'gift',
  'palette',
  'home',
  'person',
  'inbox',
  'heart',
  'flag',
  'space',
];
