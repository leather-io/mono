import { userAddsWallet, userRemovesWallet, userRenamesWallet, walletSlice } from './wallet.slice';
import { PartialWalletStore, WalletStore } from './wallet.utils';

describe(walletSlice.name, () => {
  const mockSoftwareWallet: PartialWalletStore = {
    fingerprint: 'deadbeaf',
    type: 'software',
    createdOn: '2023-10-16T12:00:00Z',
  };

  const mockLedgerWallet: WalletStore = {
    fingerprint: 'badc0ffe',
    type: 'ledger',
    name: 'My Ledger Wallet',
    createdOn: '2023-10-16T12:00:00Z',
  };

  const mockKeychains = {
    bitcoin: [],
    stacks: [],
  };

  describe('reducers', () => {
    describe(userAddsWallet.type, () => {
      test('should add wallet with default name when name is not provided', () => {
        const initialState = walletSlice.getInitialState();
        const action = userAddsWallet({
          wallet: mockSoftwareWallet,
          withKeychains: mockKeychains,
        });

        const newState = walletSlice.reducer(initialState, action);

        expect(newState.ids).toHaveLength(1);
        expect(newState.entities.deadbeaf).toEqual({
          ...mockSoftwareWallet,
          name: 'Wallet 1',
        });
      });

      test('should add wallet with provided name', () => {
        const initialState = walletSlice.getInitialState();
        const walletWithName = { ...mockSoftwareWallet, name: 'Custom Wallet Name' };
        const action = userAddsWallet({
          wallet: walletWithName,
          withKeychains: mockKeychains,
        });

        const newState = walletSlice.reducer(initialState, action);

        expect(newState.ids).toHaveLength(1);
        expect(newState.entities.deadbeaf).toEqual(walletWithName);
      });

      test('should add multiple wallets with incremented default names', () => {
        let state = walletSlice.getInitialState();

        const firstAction = userAddsWallet({
          wallet: mockSoftwareWallet,
          withKeychains: mockKeychains,
        });
        state = walletSlice.reducer(state, firstAction);

        const secondWallet = { ...mockSoftwareWallet, fingerprint: 'badc0fee' };
        const secondAction = userAddsWallet({
          wallet: secondWallet,
          withKeychains: mockKeychains,
        });
        state = walletSlice.reducer(state, secondAction);

        expect(state.ids).toHaveLength(2);
        expect(state.entities.deadbeaf?.name).toBe('Wallet 1');
        expect(state.entities.badc0fee?.name).toBe('Wallet 2');
      });
    });

    describe(userRemovesWallet.type, () => {
      test('should remove wallet by fingerprint', () => {
        let state = walletSlice.getInitialState();
        const addAction = userAddsWallet({
          wallet: mockSoftwareWallet,
          withKeychains: mockKeychains,
        });
        state = walletSlice.reducer(state, addAction);

        const removeAction = userRemovesWallet({ fingerprint: 'deadbeaf' });
        const newState = walletSlice.reducer(state, removeAction);

        expect(newState.ids).toHaveLength(0);
        expect(newState.entities.deadbeaf).toBeUndefined();
      });

      test('should not affect other wallets when removing one', () => {
        let state = walletSlice.getInitialState();

        const firstAction = userAddsWallet({
          wallet: mockSoftwareWallet,
          withKeychains: mockKeychains,
        });
        state = walletSlice.reducer(state, firstAction);

        const secondAction = userAddsWallet({
          wallet: mockLedgerWallet,
          withKeychains: mockKeychains,
        });
        state = walletSlice.reducer(state, secondAction);

        const removeAction = userRemovesWallet({ fingerprint: 'deadbeaf' });
        const newState = walletSlice.reducer(state, removeAction);

        expect(newState.ids).toHaveLength(1);
        expect(newState.entities.deadbeaf).toBeUndefined();
        expect(newState.entities.badc0ffe).toBeDefined();
      });
    });

    describe(userRenamesWallet.type, () => {
      test('should rename wallet', () => {
        let state = walletSlice.getInitialState();
        const addAction = userAddsWallet({
          wallet: mockSoftwareWallet,
          withKeychains: mockKeychains,
        });
        state = walletSlice.reducer(state, addAction);

        const renameAction = userRenamesWallet({
          fingerprint: 'deadbeaf',
          name: 'New Wallet Name',
        });
        const newState = walletSlice.reducer(state, renameAction);

        expect(newState.entities.deadbeaf?.name).toBe('New Wallet Name');

        expect(newState.entities.deadbeaf?.fingerprint).toBe('deadbeaf');
        expect(newState.entities.deadbeaf?.type).toBe('software');
      });

      test('should not affect other wallets when renaming one', () => {
        let state = walletSlice.getInitialState();

        const firstAction = userAddsWallet({
          wallet: mockSoftwareWallet,
          withKeychains: mockKeychains,
        });
        state = walletSlice.reducer(state, firstAction);

        const secondAction = userAddsWallet({
          wallet: mockLedgerWallet,
          withKeychains: mockKeychains,
        });
        state = walletSlice.reducer(state, secondAction);

        const renameAction = userRenamesWallet({
          fingerprint: 'deadbeaf',
          name: 'Updated Software Wallet',
        });
        const newState = walletSlice.reducer(state, renameAction);

        expect(newState.entities.badc0ffe.name).toBe('My Ledger Wallet');
        expect(newState.entities.deadbeaf.name).toBe('Updated Software Wallet');
      });
    });
  });
});
