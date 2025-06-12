import { RefreshControl } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useActionBarOffset } from '@/components/action-bar/action-bar';
import { useRefreshHandler } from '@/hooks/use-refresh-handler';

import { Box, HasChildren } from '@leather.io/ui/native';

function ScrollableContent({ children }: HasChildren) {
  const { actionBarOffset } = useActionBarOffset();
  const { top } = useSafeAreaInsets();
  const contentOffsetTop = top;

  const { refreshing, onRefresh } = useRefreshHandler();

  return (
    <ScrollView
      contentContainerStyle={{ paddingBottom: actionBarOffset }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          progressViewOffset={contentOffsetTop}
        />
      }
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
