import { ReactNode, useMemo } from 'react';
import Animated, {
  EntryAnimationsValues,
  EntryExitAnimationFunction,
  withTiming,
} from 'react-native-reanimated';

import { TokenBalance } from '@/features/balances/token-balance';

import { FungibleCryptoAsset, Money } from '@leather.io/models';
import { Box } from '@leather.io/ui/native';

interface AssetDisplayProps {
  name: string;
  asset: FungibleCryptoAsset;
  availableBalance: Money;
  quoteBalance: Money;
  icon: ReactNode;
  assetItemElementInitialOffset?: number | null;
  onPress?(): void;
}

export function AssetDisplay({
  name,
  asset,
  icon,
  availableBalance,
  quoteBalance,
  assetItemElementInitialOffset,
  onPress,
}: AssetDisplayProps) {
  const assetItemAnimation = useMemo(
    () => createAssetItemEnteringAnimation(assetItemElementInitialOffset),
    [assetItemElementInitialOffset]
  );

  return (
    <AnimatedBox entering={assetItemAnimation}>
      <TokenBalance
        borderColor="ink.border-default"
        borderTopStartRadius="sm"
        borderTopEndRadius="sm"
        borderWidth={1}
        ticker={asset.symbol}
        icon={icon}
        tokenName={name}
        availableBalance={availableBalance}
        quoteBalance={quoteBalance}
        px="3"
        style={{ marginBottom: -1 }}
        onPress={onPress}
      />
    </AnimatedBox>
  );
}

const AnimatedBox = Animated.createAnimatedComponent(Box);

function createAssetItemEnteringAnimation(
  assetItemElementInitialOffset?: number | null
): EntryExitAnimationFunction | undefined {
  if (!assetItemElementInitialOffset) {
    return;
  }

  return function (targetValues: EntryAnimationsValues) {
    'worklet';
    return {
      initialValues: {
        opacity: 1,
        transform: [
          { translateY: assetItemElementInitialOffset - targetValues.targetGlobalOriginY },
          { translateX: -12 },
        ],
      },
      animations: {
        opacity: withTiming(1, { duration: 240 }),
        transform: [
          { translateY: withTiming(0, { duration: 240 }) },
          { translateX: withTiming(0, { duration: 240 }) },
        ],
      },
    };
  };
}
