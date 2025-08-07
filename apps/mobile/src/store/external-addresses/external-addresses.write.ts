import { createAction, createEntityAdapter, createSlice } from '@reduxjs/toolkit';

import { handleAppResetWithState } from '../global-action';
import { ExternalAddress } from './utils';

export const externalAddressesAdapter = createEntityAdapter<ExternalAddress, string>({
  selectId: externalAddress => externalAddress.address,
});
const initialState = externalAddressesAdapter.getInitialState();

type UserAddsExternalAddressPayload = ExternalAddress;
export const userAddsExternalAddress = createAction<UserAddsExternalAddressPayload>(
  'externalAddresses/userAddsExternalAddress'
);

interface UserRemovesExternalAddressPayload {
  origin: string;
}
export const userRemovesExternalAddress = createAction<UserRemovesExternalAddressPayload>(
  'externalAddresses/userRemovesExternalAddress'
);

export const externalAddressesSlice = createSlice({
  name: 'externalAddresses',
  initialState,
  reducers: {},
  extraReducers: builder =>
    builder
      .addCase(userAddsExternalAddress, (state, action) => {
        externalAddressesAdapter.addOne(state, action.payload);
      })
      .addCase(userRemovesExternalAddress, (state, action) => {
        externalAddressesAdapter.removeOne(state, action.payload.origin);
      })
      .addCase(...handleAppResetWithState(initialState)),
});
