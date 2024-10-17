import { ReactNode } from 'react';
import Animated, { useAnimatedStyle } from 'react-native-reanimated';

import { TestId } from '@/shared/test-id';
import { useRouter } from 'expo-router';

import { Box } from '@leather.io/ui/native';

import { HeaderBackButton } from '../components/header-back-button';
import { HeaderTitle } from '../components/header-title';
import { HeaderLayout } from '../header.layout';

const AnimatedBox = Animated.createAnimatedComponent(Box);

interface AnimatedTitleHeaderProps {
  animatedStyle: ReturnType<typeof useAnimatedStyle>;
  title: string;
  rightElement?: ReactNode;
}
export function AnimatedTitleHeader({
  animatedStyle,
  title,
  rightElement,
}: AnimatedTitleHeaderProps) {
  const router = useRouter();

  return (
    <HeaderLayout
      leftElement={<HeaderBackButton onPress={() => router.back()} testID={TestId.backButton} />}
      centerElement={
        <AnimatedBox style={animatedStyle}>
          <HeaderTitle title={title} />
        </AnimatedBox>
      }
      rightElement={rightElement}
    />
  );
}
