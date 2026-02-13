import { ColorToken, token } from 'leather-styles/tokens';

import { cryptoAssetColors } from '@leather.io/constants';
import { SwappableFungibleCryptoAsset } from '@leather.io/models';

type Variant = 'initial' | 'active' | 'invalid';

const defaultCaretColor = '#2cb5c1';

const textTokenByVariant: Record<Variant, ColorToken> = {
  initial: 'ink.text-subdued',
  active: 'ink.text-primary',
  invalid: 'red.action-primary-default',
};

function evaluateVariant(value: string, touched: boolean, invalid: boolean): Variant {
  if (value === '0' && !touched) return 'initial';
  if (/^0\.0*$/.test(value)) return 'active';
  if (invalid) return 'invalid';
  return 'active';
}

function resolveCaretColor(
  variant: Variant,
  asset: SwappableFungibleCryptoAsset | undefined
): string {
  if (variant === 'invalid') return token(`colors.${textTokenByVariant.invalid}`);
  if (asset?.symbol && asset.symbol in cryptoAssetColors) return cryptoAssetColors[asset.symbol];
  return defaultCaretColor;
}

export function resolveAmountFieldColors(
  asset: SwappableFungibleCryptoAsset | undefined,
  value: string,
  touched: boolean,
  invalid: boolean
) {
  const variant = evaluateVariant(value, touched, invalid);
  return {
    textColor: token(`colors.${textTokenByVariant[variant]}`),
    caretColor: resolveCaretColor(variant, asset),
    symbolColor: token(
      `colors.${variant === 'invalid' ? textTokenByVariant[variant] : 'ink.text-subdued'}`
    ),
  };
}
