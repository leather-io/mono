import { createSelector } from '@reduxjs/toolkit';

import { RootState } from '..';
import { useAppSelector } from '../utils';
import { appsAdapter } from './apps.write';
import { AppStatus } from './utils';

const selectors = appsAdapter.getSelectors((state: RootState) => state.apps);

export function selectApps(status?: AppStatus) {
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
