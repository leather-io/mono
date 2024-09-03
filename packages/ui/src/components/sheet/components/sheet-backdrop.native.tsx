import { TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
  Extrapolation,
  interpolate,
  useAnimatedProps,
  useAnimatedStyle,
} from 'react-native-reanimated';

import { BottomSheetBackdropProps, useBottomSheet } from '@gorhom/bottom-sheet';

import { ThemeVariant } from '../../../theme-native/theme';
import { BlurView } from '../../blur-view/blur-view.native';

type BackdropProps = BottomSheetBackdropProps & {
  themeVariant: ThemeVariant;
};

const absoluteStyle = {
  position: 'absolute',
  top: 0,
  bottom: 0,
  right: 0,
  left: 0,
} satisfies ViewStyle;

const AnimatedSheet = Animated.createAnimatedComponent(BlurView);

export function Backdrop({ animatedIndex, themeVariant }: BackdropProps) {
  const { close } = useBottomSheet();
  const animatedStyle = useAnimatedStyle(() => ({
    opacity: interpolate(animatedIndex.value, [-1, -0.5], [0, 0.3], Extrapolation.CLAMP),
  }));
  const animatedProps = useAnimatedProps(() => {
    const intensity = interpolate(animatedIndex.value, [-1, -0.5], [0, 15], Extrapolation.CLAMP);
    return {
      intensity,
    };
  });
  return (
    <AnimatedSheet
      themeVariant={themeVariant}
      animatedProps={animatedProps}
      style={[
        {
          width: '100%',
          justifyContent: 'center',
        },
        absoluteStyle,
      ]}
    >
      <Animated.View
        style={[
          {
            backgroundColor: 'black',
          },
          absoluteStyle,
          animatedStyle,
        ]}
      >
        <TouchableOpacity onPress={() => close()} style={{ flex: 1 }} />
      </Animated.View>
    </AnimatedSheet>
  );
}
