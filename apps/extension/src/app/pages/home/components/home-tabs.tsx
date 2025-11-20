import { Suspense, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { Box, Stack } from 'leather-styles/jsx';

import { Tabs } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';

import { LoadingSpinner } from '@app/components/loading-spinner';

interface HomeTabsProps {
  children: React.ReactNode;
}

export function HomeTabs({ children }: HomeTabsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = useMemo(() => {
    if (location.pathname.startsWith(RouteUrls.Activity)) return RouteUrls.Activity;
    if (location.pathname.startsWith(RouteUrls.Collectibles)) return RouteUrls.Collectibles;
    return RouteUrls.Home;
  }, [location.pathname]);

  return (
    <Stack flexGrow={1} mt={{ base: 0, md: 'space.05' }} gap="space.06">
      <Tabs.Root value={activeTab} onValueChange={slug => navigate(slug)}>
        <Tabs.List>
          <Tabs.Trigger data-testid="tab-assets" value={RouteUrls.Home}>
            Assets
          </Tabs.Trigger>
          <Tabs.Trigger data-testid="tab-collectibles" value={RouteUrls.Collectibles}>
            NFTs
          </Tabs.Trigger>
          <Tabs.Trigger data-testid="tab-activity" value={RouteUrls.Activity}>
            Activity
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>
      <Suspense fallback={<LoadingSpinner pb="72px" />}>
        <Box px={{ base: 'space.05', md: 0 }} width="100%">
          {children}
        </Box>
      </Suspense>
    </Stack>
  );
}
