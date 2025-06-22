import { ScreenHeader } from '@/components/screen/screen-header/screen-header';
import { ScreenList } from '@/components/screen/screen-list';
import { ScreenScrollView } from '@/components/screen/screen-scrollview';
import { useSafeBottomInset } from '@/components/screen/use-safe-bottom-inset';

import { Box, BoxProps, HasChildren, Text } from '@leather.io/ui/native';

export function Screen(props: BoxProps) {
  return <Box flex={1} backgroundColor="ink.background-primary" {...props} />;
}

function Body(props: BoxProps) {
  const bottomInset = useSafeBottomInset();
  return <Box flex={1} style={{ paddingBottom: bottomInset }} {...props} />;
}

function Title({ children }: HasChildren) {
  return (
    <Box width={320} px="5" pb="5" mb="3">
      <Text variant="heading03">{children}</Text>
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
Screen.ScrollView = ScreenScrollView;
Screen.List = ScreenList;
