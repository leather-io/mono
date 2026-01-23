import { PayloadAction, createEntityAdapter, createSlice } from '@reduxjs/toolkit';

interface RequiredProps {
  id: string;
  fingerprint: string;
}
export function generateLedgerChainKeyStorageSlice<KeyDetails extends RequiredProps>(name: string) {
  const adapter = createEntityAdapter<KeyDetails>();

  const initialState = adapter.getInitialState();

  const slice = createSlice({
    name: name + 'Keys',
    initialState,
    reducers: {
      addKeys(state, { payload }: PayloadAction<KeyDetails[]>) {
        adapter.addMany(state, payload);
      },
      signOut(state) {
        adapter.removeAll(state);
      },
    },
  });

  return { slice, initialState, adapter };
}
