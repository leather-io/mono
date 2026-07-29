import { type ReactNode } from 'react';
import { Outlet } from 'react-router';

import { ActivitySelectors } from '@tests/selectors/activity.selectors';
import { Stack, styled } from 'leather-styles/jsx';

import { ActivityEmpty } from './activity-empty';
import { ActivityError } from './activity-error';
import { ActivityLoading } from './activity-loading';
import { ActivityRefreshError } from './activity-refresh-error';

interface ActivityListLayoutProps {
  children: ReactNode;
  isLoading: boolean;
  isError: boolean;
  isRefetchError: boolean;
  hasActivity: boolean;
  onRetry(): void;
}

export function ActivityListLayout({
  children,
  isLoading,
  isError,
  isRefetchError,
  hasActivity,
  onRetry,
}: ActivityListLayoutProps) {
  function renderContent() {
    if (isLoading) return <ActivityLoading />;
    if (isError && !hasActivity) return <ActivityError onRetry={onRetry} />;
    if (!hasActivity) return <ActivityEmpty />;
    return (
      <>
        {isRefetchError && <ActivityRefreshError onRetry={onRetry} />}
        {children}
        <styled.div
          position="absolute"
          bottom="0"
          left="0"
          right="0"
          height="48px"
          bgGradient="to-t"
          gradientFrom="ink.background-primary"
          gradientTo="transparent"
          pointerEvents="none"
        />
      </>
    );
  }

  return (
    <Stack
      data-testid={ActivitySelectors.ActivityList}
      minWidth="100%"
      flexGrow={1}
      minHeight={0}
      height="100%"
      position="relative"
    >
      {renderContent()}
      <Outlet />
    </Stack>
  );
}
