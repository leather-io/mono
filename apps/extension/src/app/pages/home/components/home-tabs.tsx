import { Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { Box, Stack } from 'leather-styles/jsx';

import { Tabs } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';

import { LoadingSpinner } from '@app/components/loading-spinner';

interface HomeTabsProps {
  children: React.ReactNode;
  showCollectibles?: boolean;
}

function getHomeTabs(showCollectibles: boolean) {
  return [
    {
      label: 'Assets',
      value: RouteUrls.Home,
      testId: 'tab-assets',
    },
    ...(showCollectibles
      ? [
          {
            label: 'NFTs',
            value: RouteUrls.Collectibles,
            testId: 'tab-collectibles',
          },
        ]
      : []),
    {
      label: 'Activity',
      value: RouteUrls.Activity,
      testId: 'tab-activity',
    },
  ];
}

export function HomeTabs({ children, showCollectibles = true }: HomeTabsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { pathname } = location;
  const homeTabs = getHomeTabs(showCollectibles);
  const activeTab =
    [RouteUrls.Activity, RouteUrls.Collectibles].find(route => pathname.startsWith(route)) ??
    RouteUrls.Home;

  return (
    <Stack flexGrow={1} gap="space.06">
      <Tabs.Root value={activeTab}>
        <Tabs.List>
          {homeTabs.map(tab => (
            <Tabs.Trigger
              key={tab.value}
              data-testid={tab.testId}
              value={tab.value}
              onClick={() => navigate(tab.value)}
            >
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
