import { useDispatch } from 'react-redux';

import { type PayloadAction, createSlice } from '@reduxjs/toolkit';
import type { leather } from '~/helpers/leather-sdk';

import type { RootState } from '../store';

type GetAddressesResult = Awaited<ReturnType<typeof leather.getAddresses>>['addresses'];

export const accountSlice = createSlice({
  name: 'accounts',
  initialState: { accounts: [] as GetAddressesResult },
  reducers: {
    userConnects(state, action: PayloadAction<GetAddressesResult>) {
      state.accounts = action.payload;
    },
    userSignsOut(state) {
      state.accounts = [];
    },
  },
});

const selectAccounts = (state: RootState) => state.accounts;

export function useAccounts() {
  const dispatch = useDispatch();

  return {
    connectUser(accounts: GetAddressesResult) {
      dispatch(accountSlice.actions.userConnects(accounts));
    },
    signOutUser() {
      dispatch(accountSlice.actions.userSignsOut());
    },
  };
}
