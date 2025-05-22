import { useMemo } from 'react';
import {
  AnimatableValue,
  SharedValue,
  useAnimatedStyle,
  withDelay,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

import { type AllProps, all, composeRestyleFunctions, useTheme } from '@shopify/restyle';

import { Theme } from '../../theme-native';
import { AnimationSettings, PressEffects } from './pressable.types.native';

const restyleFunctions = composeRestyleFunctions<Theme, AllProps<Theme>>(all);
const defaultAnimationSettings: AnimationSettings = {
  type: 'spring',
  delay: 0,
};

type PressEffectsWithRawStylesResult = {
  [K in keyof PressEffects]: {
    from: AnimatableValue;
    to: AnimatableValue;
    settings?: AnimationSettings;
  };
};

export function convertPressEffectRestyleValuesToRawStyles(props: PressEffects, theme: Theme) {
  return Object.entries(props).reduce<PressEffectsWithRawStylesResult>(
    (result, [key, value]) => ({
      ...result,
      [key]: {
        // buildStyle return type is incomplete: missing FlexStyle:
        // https://github.com/Shopify/restyle/blob/5fbb3f482f2d7b8f9cd63b7a995c03890ee5282c/src/types.ts#L86
        // TODO: Object entries needs narrowing down
        // @ts-expect-error see details above
        to: restyleFunctions.buildStyle(
          { [key]: value.to },
          { theme, dimensions: { width: 300, height: 300 } }
        )[key],

        // @ts-expect-error see details above
        from: restyleFunctions.buildStyle(
          { [key]: value.from },
          { theme, dimensions: { width: 300, height: 300 } }
        )[key],
        settings: value.settings,
      },
    }),
    {}
  );
}

export function usePressEffectStyle({
  pressed,
  pressEffects,
}: {
  pressed: SharedValue<boolean>;
  pressEffects: PressEffects;
}) {
  const theme = useTheme<Theme>();
  const animationEntries = useMemo(() => {
    const pressEffectsWithRawStyles = convertPressEffectRestyleValuesToRawStyles(
      pressEffects,
      theme
    );
    return Object.entries(pressEffectsWithRawStyles).map(([key, value]) => {
      const { settings = defaultAnimationSettings } = value;
      const {
        type = defaultAnimationSettings.type,
        delay = defaultAnimationSettings.delay,
        config,
      } = settings;
      const animationFunction = {
        spring: withSpring,
        timing: withTiming,
      }[type];

      return {
        key,
        from: value.from,
        to: value.to,
        delay,
        animationFunction,
        config,
      };
    });
  }, [theme, pressEffects]);

  return useAnimatedStyle(() => {
    return animationEntries.reduce((result, entry) => {
      // only apply the delay when transitioning from default to pressed state.
      const derivedDelay = entry.delay && pressed.value ? entry.delay : 0;

      return {
        ...result,
        [entry.key]: withDelay(
          derivedDelay,
          entry.animationFunction(pressed.value ? entry.to : entry.from, entry.config)
        ),
      };
    }, {});
  });
}
