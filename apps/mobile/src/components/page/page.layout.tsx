import { ScrollView } from 'react-native-gesture-handler';

import { useActionBarOffset } from '@/components/action-bar/action-bar';
import { RefreshControl } from '@/features/refresh-control/refresh-control';

import { Box, HasChildren } from '@leather.io/ui/native';

function ScrollableContent({ children }: HasChildren) {
  const { actionBarOffset } = useActionBarOffset();

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: actionBarOffset }}
      refreshControl={<RefreshControl />}
    >
      {children}
    </ScrollView>
  );
}

interface PageLayoutProps extends HasChildren {
  scrollable?: boolean;
}
export function PageLayout({ children, scrollable = true }: PageLayoutProps) {
  return (
    <Box flex={1} bg="ink.background-primary">
      {scrollable ? <ScrollableContent>{children}</ScrollableContent> : children}
    </Box>
  );
}
