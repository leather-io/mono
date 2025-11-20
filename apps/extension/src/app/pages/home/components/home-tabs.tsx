import { Suspense, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { Box, Stack } from 'leather-styles/jsx';

import { Tabs } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';

import { LoadingSpinner } from '@app/components/loading-spinner';

interface HomeTabsProps {
  children: React.ReactNode;
}

const homeTabs = [
  {
    label: 'Assets',
    value: RouteUrls.Home,
    testId: 'tab-assets',
  },
  {
    label: 'NFTs',
    value: RouteUrls.Collectibles,
    testId: 'tab-collectibles',
  },
  {
    label: 'Activity',
    value: RouteUrls.Activity,
    testId: 'tab-activity',
  },
] as const;

export function HomeTabs({ children }: HomeTabsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const activeTab = useMemo(() => {
    const matchingTab = homeTabs.find(tab => location.pathname.startsWith(tab.value));
    return matchingTab?.value ?? RouteUrls.Home;
  }, [location.pathname]);

  return (
    <Stack flexGrow={1} mt={{ base: 0, md: 'space.05' }} gap="space.06">
      <Tabs.Root value={activeTab} onValueChange={slug => navigate(slug)}>
        <Tabs.List>
          {homeTabs.map(tab => (
            <Tabs.Trigger key={tab.value} data-testid={tab.testId} value={tab.value}>
              {tab.label}
            </Tabs.Trigger>
          ))}
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
