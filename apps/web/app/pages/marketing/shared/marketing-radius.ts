// Marketing surfaces follow the product pages (staking, sBTC): top-level cards use `md` (8px),
// anything nested inside them `sm` (4px). Icons scale with their size like square avatars, but
// stay below the card radius so a small icon never looks rounder than the card that holds it.
const iconRadiusRatio = 0.2;
const maxIconRadiusPx = 6;

export function iconRadius(sizePx: number) {
  return `${Math.min(Math.round(sizePx * iconRadiusRatio), maxIconRadiusPx)}px`;
}
