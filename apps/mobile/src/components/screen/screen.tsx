import { ScreenScrollView } from '@/components/screen/screen-scrollview';

import { Box, BoxProps, HasChildren, Text } from '@leather.io/ui/native';

export function Screen(props: BoxProps) {
  return <Box flex={1} {...props} backgroundColor="ink.background-primary" />;
}

function Body(props: BoxProps) {
  return <Box flex={1} {...props} />;
}

function Title({ children }: HasChildren) {
  return (
    <Box width={320} px="5" pb="5" mb="3">
      <Text variant="heading03">{children}</Text>
    </Box>
  );
}

Screen.Body = Body;
Screen.Title = Title;
Screen.ScrollView = ScreenScrollView;
