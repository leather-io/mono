import { ScreenHeader } from '@/components/screen/screen-header/screen-header';
import { ScreenHeaderAnimationTarget } from '@/components/screen/screen-header/screen-header-animation-target';
import { ScreenList } from '@/components/screen/screen-list';
import { ScreenScrollProvider } from '@/components/screen/screen-scroll-context';
import { ScreenScrollView } from '@/components/screen/screen-scrollview';
import { useSafeBottomInset } from '@/components/screen/use-safe-bottom-inset';

import { Box, BoxProps, HasChildren, Text } from '@leather.io/ui/native';

export function Screen(props: BoxProps) {
  return (
    <ScreenScrollProvider>
      <Box flex={1} backgroundColor="ink.background-primary" {...props} />
    </ScreenScrollProvider>
  );
}

function Body(props: BoxProps) {
  const bottomInset = useSafeBottomInset();
  return <Box flex={1} style={{ paddingBottom: bottomInset }} {...props} />;
}

function Title({ children }: HasChildren) {
  return (
    <Box width={320} px="5" pb="5" mb="3">
      <Screen.HeaderAnimationTarget>
        <Text variant="heading03">{children}</Text>
      </Screen.HeaderAnimationTarget>
    </Box>
  );
}

function Footer(props: BoxProps) {
  const bottomInset = useSafeBottomInset();
  return <Box px="5" position="absolute" width="100%" bottom={bottomInset} {...props} />;
}

Screen.Body = Body;
Screen.Title = Title;
Screen.Footer = Footer;
Screen.Header = ScreenHeader;
Screen.HeaderAnimationTarget = ScreenHeaderAnimationTarget;
Screen.ScrollView = ScreenScrollView;
Screen.List = ScreenList;
