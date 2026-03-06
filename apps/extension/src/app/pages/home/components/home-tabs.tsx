import { Suspense } from 'react';
import { useLocation, useNavigate } from 'react-router';

import { Box, Stack } from 'leather-styles/jsx';

import { Tabs } from '@leather.io/ui';

import { RouteUrls } from '@shared/route-urls';

import { LoadingSpinner } from '@app/components/loading-spinner';
import { useBackgroundLocation } from '@app/routes/hooks/use-background-location';

interface HomeTabsProps {
  children: React.ReactNode;
  showCollectibles?: boolean;
}

function getHomeTabs(showCollectibles: boolean) {
  return [
    {
      label: 'Tokens',
      value: RouteUrls.Home,
      testId: 'tab-tokens',
    },
    ...(showCollectibles
      ? [
          {
            label: 'Collectibles',
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

function getActiveTab(pathname: string) {
  return (
    [RouteUrls.Activity, RouteUrls.Collectibles].find(route => pathname.startsWith(route)) ??
    RouteUrls.Home
  );
}

export function HomeTabs({ children, showCollectibles = true }: HomeTabsProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const backgroundLocation = useBackgroundLocation();
  const { pathname } = location;
  const homeTabs = getHomeTabs(showCollectibles);
  const activeTab = getActiveTab(backgroundLocation?.pathname ?? pathname);

  return (
    <Stack flexGrow={1} gap="space.05">
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
        <Box px={['space.05', null, 0]} width="100%">
          {children}
        </Box>
      </Suspense>
    </Stack>
  );
}
