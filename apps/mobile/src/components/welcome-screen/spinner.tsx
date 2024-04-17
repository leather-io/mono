import { useEffect } from 'react';
import { Image } from 'react-native';
import Animated, {
  cancelAnimation,
  useAnimatedStyle,
  useSharedValue,
} from 'react-native-reanimated';

import { SPINNER, animate, infiniteLoop } from './animation-utils';

export function Spinner() {
  const spinner = {
    rotationDeg: useSharedValue<number>(SPINNER.startPosition.rotationDeg),
  };

  useEffect(() => {
    animate(spinner, infiniteLoop, SPINNER.endPosition);
    return () => cancelAnimation(spinner.rotationDeg);
  }, []);

  const spinnerStyle = useAnimatedStyle(
    () => ({
      transform: [{ rotateZ: `${spinner.rotationDeg.value}deg` }],
    }),
    [spinner.rotationDeg.value]
  );
  return (
    <Animated.View style={spinnerStyle}>
      <Image style={{ width: 20, height: 20 }} source={require('@/assets/spinner.png')} />
    </Animated.View>
  );
}
