import Animated from 'react-native-reanimated';

import { AnimatedTitleHeader } from '@/components/headers/animated-header/animated-title-header';

import { Box, HasChildren, TextProps } from '@leather.io/ui/native';

import { ReversibleHeader } from '../components/animated-reversible-header';
import { ContentTitle } from '../components/content-title';
import { useAnimatedHeader } from './animated-header.hooks';

interface ScrollViewStylesProps {
  gap?: number;
  paddingBottom?: number;
  paddingHorizontal?: number;
}

interface AnimatedHeaderScreenLayoutProps extends HasChildren {
  rightHeaderElement?: React.ReactNode;
  rightTitleElement?: React.ReactNode;
  title: string | React.ReactNode;
  contentTitle?: string | React.ReactNode;
  contentTitleStyles?: TextProps;
  subtitle?: string | React.ReactNode;
  contentContainerStyles?: ScrollViewStylesProps;
  isHeaderReversible?: boolean;
}

export function AnimatedHeaderScreenLayout({
  children,
  rightHeaderElement,
  rightTitleElement,
  title,
  contentTitle,
  contentTitleStyles,
  subtitle,
  contentContainerStyles,
  isHeaderReversible = false,
}: AnimatedHeaderScreenLayoutProps) {
  const {
    defaultStyles,
    contentHeight,
    viewHeight,
    onScrollHandler,
    animatedHeaderStyle,
    animatedBlurOverlayStyle,
    onContentSizeChange,
    onLayoutChange,
    scrollY,
  } = useAnimatedHeader();

  return (
    <>
      <AnimatedTitleHeader
        animatedBlurOverlayStyle={animatedBlurOverlayStyle}
        animatedStyle={animatedHeaderStyle}
        rightElement={rightHeaderElement}
        title={title}
        subtitle={subtitle}
        scrollY={scrollY}
        isHeaderReversible={isHeaderReversible}
      />
      <Box bg="ink.background-primary" flex={1} onLayout={onLayoutChange}>
        <Animated.ScrollView
          contentContainerStyle={{
            ...defaultStyles,
            ...contentContainerStyles,
          }}
          onContentSizeChange={onContentSizeChange}
          onScroll={onScrollHandler}
          scrollEnabled={contentHeight > viewHeight}
          scrollEventThrottle={16}
        >
          <Box flexDirection="row" justifyContent="space-between" paddingBottom="5">
            <Box alignItems="flex-start" flex={1} maxWidth={320}>
              {isHeaderReversible ? (
                <ReversibleHeader title={title} subtitle={subtitle} scrollY={scrollY} />
              ) : (
                <ContentTitle title={contentTitle} {...contentTitleStyles} />
              )}
            </Box>
            <Box alignItems="flex-end">{rightTitleElement}</Box>
          </Box>
          {children}
        </Animated.ScrollView>
      </Box>
    </>
  );
}
