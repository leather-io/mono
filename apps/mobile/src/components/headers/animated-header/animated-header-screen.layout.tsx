import Animated from 'react-native-reanimated';

import { AnimatedTitleHeader } from '@/components/headers/animated-header/animated-title-header';
import { HasChildren } from '@/utils/types';

import { Box, Text } from '@leather.io/ui/native';

import { useAnimatedHeader } from './animated-header.hooks';

interface AnimatedHeaderScreenLayoutProps extends HasChildren {
  rightHeaderElement?: React.ReactNode;
  rightTitleElement?: React.ReactNode;
  title: string;
}
export function AnimatedHeaderScreenLayout({
  children,
  rightHeaderElement,
  rightTitleElement,
  title,
}: AnimatedHeaderScreenLayoutProps) {
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
        <Animated.ScrollView
          contentContainerStyle={defaultStyles}
          onContentSizeChange={onContentSizeChange}
          onScroll={onScrollHandler}
          scrollEnabled={contentHeight > viewHeight}
          scrollEventThrottle={16}
        >
          <Box flexDirection="row" justifyContent="space-between" paddingBottom="5">
            <Box alignItems="flex-start" flex={1} maxWidth={320}>
              <Text fontWeight={800} variant="heading03">
                {title}
              </Text>
            </Box>
            <Box alignItems="flex-end">{rightTitleElement}</Box>
          </Box>
          {children}
        </Animated.ScrollView>
      </Box>
    </>
  );
}
