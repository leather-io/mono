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
  scrollable?: boolean;
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
  scrollable = true,
}: AnimatedHeaderScreenLayoutProps) {
  const { animatedHeaderStyle, animatedBlurOverlayStyle, onLayoutChange, scrollY } =
    useAnimatedHeader();

  const header = (
    <Header
      isHeaderReversible={isHeaderReversible}
      title={title}
      subtitle={subtitle}
      contentTitle={contentTitle}
      contentTitleStyles={contentTitleStyles}
      rightTitleElement={rightTitleElement}
    />
  );

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
        {scrollable ? (
          <AnimatedScrollView contentContainerStyles={contentContainerStyles} title={title}>
            {header}
            {children}
          </AnimatedScrollView>
        ) : (
          <>
            {header}
            {children}
          </>
        )}
      </Box>
    </>
  );
}

function Header({
  isHeaderReversible,
  title,
  subtitle,
  contentTitle,
  contentTitleStyles,
  rightTitleElement,
}: AnimatedHeaderScreenLayoutProps) {
  const { scrollY } = useAnimatedHeader();
  return (
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
  );
}

function AnimatedScrollView({ children, contentContainerStyles }: AnimatedHeaderScreenLayoutProps) {
  const { defaultStyles, contentHeight, viewHeight, onScrollHandler, onContentSizeChange } =
    useAnimatedHeader();
  return (
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
      {children}
    </Animated.ScrollView>
  );
}
