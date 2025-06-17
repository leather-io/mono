import { ReactNode, createContext, use, useReducer } from 'react';

import { SelectedAsset } from '@/features/receive/screens/select-asset';
import { Account } from '@/store/accounts/accounts';

import { isDefined } from '@leather.io/utils';

interface ReceiveState {
  selectedAccount: Account | null;
  selectedAsset: SelectedAsset | null;
  accounts: Account[];
}

type Action =
  | { type: 'SET_ACCOUNT'; payload: Account }
  | { type: 'SET_ASSET'; payload: SelectedAsset }
  | { type: 'RESET' };

function reducer(state: ReceiveState, action: Action) {
  switch (action.type) {
    case 'SET_ACCOUNT':
      return { ...state, selectedAccount: action.payload };
    case 'SET_ASSET':
      return { ...state, selectedAsset: action.payload };
    default:
      return state;
  }
}

interface InitializerParams {
  accounts: Account[];
  selectedAccount?: Account;
  selectedAsset?: SelectedAsset;
}

function initializer({
  accounts,
  selectedAccount,
  selectedAsset,
}: InitializerParams): ReceiveState {
  if (accounts.length === 1 && isDefined(accounts[0])) {
    return {
      selectedAccount: accounts[0],
      selectedAsset: null,
      accounts,
    };
  }

  return {
    selectedAccount: selectedAccount ?? null,
    selectedAsset: selectedAsset ?? null,
    accounts,
  };
}

interface ReceiveFlowContextValue {
  state: ReceiveState;
  selectAccount(account: Account | null): void;
  selectAsset(asset: SelectedAsset | null): void;
}

const ReceiveFlowContext = createContext<ReceiveFlowContextValue | null>(null);

interface ReceiveProviderProps {
  children: ReactNode;
  initialData: {
    accounts: Account[];
    selectedAccount?: Account;
    selectedAsset?: SelectedAsset;
  };
}

export function ReceiveFlowProvider({ initialData, children }: ReceiveProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialData, initializer);

  function selectAccount(account: Account) {
    dispatch({ type: 'SET_ACCOUNT', payload: account });
  }

  function selectAsset(asset: SelectedAsset) {
    dispatch({ type: 'SET_ASSET', payload: asset });
  }

  return (
    <ReceiveFlowContext.Provider value={{ state, selectAccount, selectAsset }}>
      {children}
    </ReceiveFlowContext.Provider>
  );
}

export function useReceiveFlowContext() {
  const context = use(ReceiveFlowContext);
  if (!context) {
    throw new Error('useReceiveFlowContext must be used within ReceiveFlowProvider');
  }
  return context;
}
