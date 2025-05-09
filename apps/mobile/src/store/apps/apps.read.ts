import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '..';
import { useAppSelector } from '../utils';
import { appsAdapter } from './apps.write';
import { App, AppStatus } from './utils';

const selectors = appsAdapter.getSelectors((state: RootState) => state.apps);

function selectApps(status?: AppStatus) {
  return createSelector(selectors.selectAll, apps => {
    switch (status) {
      case 'recently_visited':
        return apps.filter(app => app.status === 'recently_visited');
      case 'connected':
        return apps.filter(app => app.status === 'connected');
      default:
        return apps;
    }
  });
}

export function useAppByOrigin(origin: string) {
  return useAppSelector(state => selectors.selectById(state, origin));
}

export function useApps(status?: AppStatus) {
  const list = useAppSelector(selectApps(status));
  return {
    list,
    hasAccounts: list.length > 0,
  };
}

export type ConnectedAppAccountIdMap = Record<string, App[]>;

function connectedAppsToAccountIdMap(acc: ConnectedAppAccountIdMap, app: App) {
  if (app.status === 'connected') {
    const appsByAccount = acc[app.accountId];
    if (appsByAccount) {
      acc[app.accountId] = [...appsByAccount, app];
    } else {
      acc[app.accountId] = [app];
    }
  }
  return acc;
}

export function getConnectedAppsToAccountIdMap(apps: App[]) {
  return apps.reduce(connectedAppsToAccountIdMap, {});
}
