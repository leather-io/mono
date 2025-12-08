import { type ReactNode } from 'react';
import { Outlet } from 'react-router';

import { Stack, styled } from 'leather-styles/jsx';

import { ActivityEmpty } from './activity-empty';
import { ActivityLoading } from './activity-loading';

interface ActivityListLayoutProps {
  children: ReactNode;
  isLoading: boolean;
  hasActivity: boolean;
}

export function ActivityListLayout({ children, isLoading, hasActivity }: ActivityListLayoutProps) {
  if (isLoading) {
    return (
      <>
        <ActivityLoading />
        <Outlet />
      </>
    );
  }

  if (!hasActivity) {
    return (
      <>
        <ActivityEmpty />
        <Outlet />
      </>
    );
  }

  return (
    <Stack minWidth="100%" flexGrow={1} minHeight={0} height="100%" position="relative">
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
      />
    </Stack>
  );
}
