import { ReactNode, createContext, useContext, useReducer } from 'react';

import { SelectedAsset } from '@/features/receive/screens/select-asset';
import { Account } from '@/store/accounts/accounts';

export type ReceiveType = 'stacks' | 'bitcoin' | 'native-segwit' | 'taproot' | 'all';

interface ReceiveState {
  selectedAsset: SelectedAsset | null;
  currentAccount: Account;
  receiveType: ReceiveType;
}

type Action = { type: 'SET_ASSET'; payload: SelectedAsset } | { type: 'RESET' };

function reducer(state: ReceiveState, action: Action) {
  switch (action.type) {
    case 'SET_ASSET':
      return { ...state, selectedAsset: action.payload };
    default:
      return state;
  }
}

interface InitialData {
  selectedAsset?: SelectedAsset;
  currentAccount: Account;
  receiveType: ReceiveType;
}

function initializer({ selectedAsset, currentAccount, receiveType }: InitialData): ReceiveState {
  return {
    selectedAsset: selectedAsset ?? null,
    currentAccount,
    receiveType,
  };
}

interface ReceiveFlowContextValue {
  state: ReceiveState;
  selectAsset(asset: SelectedAsset | null): void;
}

const ReceiveFlowContext = createContext<ReceiveFlowContextValue | null>(null);

interface ReceiveProviderProps {
  children: ReactNode;
  initialData: InitialData;
}

export function ReceiveFlowProvider({ initialData, children }: ReceiveProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialData, initializer);

  function selectAsset(asset: SelectedAsset) {
    dispatch({ type: 'SET_ASSET', payload: asset });
  }

  return (
    <ReceiveFlowContext.Provider value={{ state, selectAsset }}>
      {children}
    </ReceiveFlowContext.Provider>
  );
}

export function useReceiveFlowContext() {
  const context = useContext(ReceiveFlowContext);
  if (!context) {
    throw new Error('useReceiveFlowContext must be used within ReceiveFlowProvider');
  }
  return context;
}
