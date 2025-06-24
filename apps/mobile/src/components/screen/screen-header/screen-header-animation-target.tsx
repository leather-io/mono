import { ReactNode } from 'react';
import { LayoutChangeEvent } from 'react-native';
import Animated from 'react-native-reanimated';

import { useScreenScrollContext } from '@/components/screen/screen-scroll-context';

import { useOnMount } from '@leather.io/ui/native';

interface ScreenHeaderAnimationTargetProps {
  children: ReactNode;
}

export function ScreenHeaderAnimationTarget({ children }: ScreenHeaderAnimationTargetProps) {
  const { animationTargetHeight, registerScrollTarget } = useScreenScrollContext();

  useOnMount(registerScrollTarget);

  function handleLayout(event: LayoutChangeEvent) {
    animationTargetHeight.value = event.nativeEvent.layout.height;
  }

  return <Animated.View onLayout={handleLayout}>{children}</Animated.View>;
}
