import { ScreenScrollView } from '@/components/screen/screen-scrollview';

import { Box, BoxProps } from '@leather.io/ui/native';

export function Screen(props: BoxProps) {
  return <Box flex={1} {...props} backgroundColor="ink.background-primary" />;
}

function Body(props: BoxProps) {
  return <Box flex={1} {...props} />;
}

Screen.Body = Body;
Screen.ScrollView = ScreenScrollView;
