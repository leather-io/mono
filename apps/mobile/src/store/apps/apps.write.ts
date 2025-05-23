import { createAction, createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import { handleAppResetWithState } from '../global-action';
import { handleEntityActionWith } from '../utils';
import { App } from './utils';

export const appsAdapter = createEntityAdapter<App, string>({
  selectId: app => app.origin,
});
const initialState = appsAdapter.getInitialState();

type UserAddsAppPayload = App;
export const userAddsApp = createAction<UserAddsAppPayload>('apps/userAddsApp');

interface UserRemovesAppPayload {
  origin: string;
}
export const userRemovesApp = createAction<UserRemovesAppPayload>('apps/userRemovesApp');

interface UserConnectsAppPayload {
  origin: string;
  accountId: string;
}
export const userConnectsApp = createAction<UserConnectsAppPayload>('apps/userConnectsApp');

export const appsSlice = createSlice({
  name: 'apps',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      // Provision the first account with new wallet creation
      .addCase(userAddsApp, (state, action) => {
        appsAdapter.addOne(state, action.payload);
      })
      .addCase(
        userConnectsApp,
        handleEntityActionWith(appsAdapter.updateOne, payload => ({
          id: payload.origin,
          changes: {
            status: 'connected' as const,
            accountId: payload.accountId,
          },
        }))
      )
      .addCase(userRemovesApp, (state, action) => {
        appsAdapter.removeOne(state, action.payload.origin);
      })
      .addCase(...handleAppResetWithState(initialState)),
});
