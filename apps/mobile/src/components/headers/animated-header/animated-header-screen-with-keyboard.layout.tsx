import { useState } from 'react';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Animated from 'react-native-reanimated';

import { AnimatedTitleHeader } from '@/components/headers/animated-header/animated-title-header';
import { HasChildren } from '@/utils/types';

import { Box, Text } from '@leather.io/ui/native';

import { useAnimatedHeader } from './animated-header.hooks';

const AnimatedKeyboardAwareScrollView = Animated.createAnimatedComponent(KeyboardAwareScrollView);
const AnimatedBox = Animated.createAnimatedComponent(Box);

interface AnimatedHeaderScreenWithKeyboardLayoutProps extends HasChildren {
  rightHeaderElement?: React.ReactNode;
  rightTitleElement?: React.ReactNode;
  title: string;
}
export function AnimatedHeaderScreenWithKeyboardLayout({
  children,
  rightHeaderElement,
  rightTitleElement,
  title,
}: AnimatedHeaderScreenWithKeyboardLayoutProps) {
  const [keyboardEnabled, setKeyboardEnabled] = useState(false);
  const {
    defaultStyles,
    contentHeight,
    viewHeight,
    onScrollHandler,
    animatedHeaderStyle,
    onContentSizeChange,
    onLayoutChange,
  } = useAnimatedHeader();

  return (
    <>
      <AnimatedTitleHeader
        animatedStyle={animatedHeaderStyle}
        rightElement={rightHeaderElement}
        title={title}
      />
      <Box bg="ink.background-primary" flex={1} onLayout={onLayoutChange}>
        <AnimatedKeyboardAwareScrollView
          contentContainerStyle={defaultStyles}
          onContentSizeChange={onContentSizeChange}
          onKeyboardDidShow={() => setKeyboardEnabled(true)}
          onKeyboardWillHide={() => setKeyboardEnabled(false)}
          onScroll={onScrollHandler}
          scrollEnabled={keyboardEnabled || contentHeight > viewHeight}
          scrollEventThrottle={16}
        >
          <AnimatedBox flex={1}>
            <Box flexDirection="row" justifyContent="space-between" gap="6" paddingBottom="5">
              <Box alignItems="flex-start" flex={1} maxWidth={320}>
                <Text fontWeight={800} variant="heading03">
                  {title}
                </Text>
              </Box>
              <Box alignItems="flex-end">{rightTitleElement}</Box>
            </Box>
            {children}
          </AnimatedBox>
        </AnimatedKeyboardAwareScrollView>
      </Box>
    </>
  );
}
