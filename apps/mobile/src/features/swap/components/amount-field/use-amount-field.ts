import { Easing, useAnimatedStyle, useDerivedValue, withTiming } from 'react-native-reanimated';

import { cryptoAssetColors } from '@leather.io/constants';
import { SwappableFungibleCryptoAsset } from '@leather.io/models';
import { Theme, useTheme } from '@leather.io/ui/native';

type Variant = 'initial' | 'active' | 'invalid';

interface UseAmountFieldParams {
  asset?: SwappableFungibleCryptoAsset;
  value: string;
  invalid?: boolean;
}

const colorAnimationConfig = { duration: 200, easing: Easing.ease };

const textColorByVariant: Record<Variant, keyof Theme['colors']> = {
  initial: 'ink.text-subdued-primary',
  active: 'ink.text-primary',
  invalid: 'red.action-primary-default',
};

export function useAmountField({ asset, invalid, value }: UseAmountFieldParams) {
  const theme = useTheme();
  const variant = evaluateVariant({ invalid, value });

  const currentColor = useDerivedValue(() => {
    return withTiming(theme.colors[textColorByVariant[variant]], colorAnimationConfig);
  });

  const animatedTextStyle = useAnimatedStyle(() => ({
    color: currentColor.value,
  }));

  return {
    variant,
    animatedTextStyle,
    caretColor: getCaretColor(asset, theme.colors[textColorByVariant['invalid']], variant),
  };
}

function getCaretColor(
  asset: SwappableFungibleCryptoAsset | undefined,
  invalidColor: string,
  variant: Variant
) {
  if (variant === 'invalid') return invalidColor;
  if (!asset?.symbol || !(asset.symbol in cryptoAssetColors)) return;
  return cryptoAssetColors[asset.symbol];
}

interface EvaluateVariantParams {
  invalid?: boolean;
  value: string;
}

function evaluateVariant({ invalid, value }: EvaluateVariantParams): Variant {
  if (value === '0') return 'initial';
  if (/^0\.0*$/.test(value)) return 'active';
  if (invalid) return 'invalid';
  return 'active';
}
