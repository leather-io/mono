import { RootState } from '..';
import { appPermissionsAdapter } from './app-permissions.slice';

function selectAppPermissionsSlice(state: RootState) {
  return state.appPermissions;
}
export const appPermissionsSelectors =
  appPermissionsAdapter.getSelectors<RootState>(selectAppPermissionsSlice);
