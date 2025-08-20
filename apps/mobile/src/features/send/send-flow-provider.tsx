import { ReactNode, createContext, useContext, useReducer } from 'react';

import { Account } from '@/store/accounts/accounts';
import { InputCurrencyMode } from '@/utils/types';

import { FungibleCryptoAsset } from '@leather.io/models';

interface SendState {
  selectedAsset: FungibleCryptoAsset | null;
  currentAccount: Account;
  inputCurrencyMode: InputCurrencyMode;
}

type Action =
  | { type: 'SET_ASSET'; payload: FungibleCryptoAsset }
  | { type: 'SET_INPUT_CURRENCY_MODE'; payload: InputCurrencyMode }
  | { type: 'RESET' };

function reducer(state: SendState, action: Action) {
  switch (action.type) {
    case 'SET_ASSET':
      return { ...state, selectedAsset: action.payload };
    case 'SET_INPUT_CURRENCY_MODE':
      return { ...state, inputCurrencyMode: action.payload };
    default:
      return state;
  }
}

interface InitialData {
  selectedAsset?: FungibleCryptoAsset;
  currentAccount: Account;
}

function initializer({ selectedAsset, currentAccount }: InitialData): SendState {
  return {
    selectedAsset: selectedAsset ?? null,
    inputCurrencyMode: 'crypto',
    currentAccount,
  };
}

interface SendFlowContextValue {
  state: SendState;
  selectAsset(asset: FungibleCryptoAsset | null): void;
  selectInputCurrencyMode(mode: InputCurrencyMode): void;
}

const SendFlowContext = createContext<SendFlowContextValue | null>(null);

interface SendProviderProps {
  children: ReactNode;
  initialData: InitialData;
}

export function SendFlowProvider({ initialData, children }: SendProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialData, initializer);

  function selectAsset(asset: FungibleCryptoAsset) {
    dispatch({ type: 'SET_ASSET', payload: asset });
  }

  function selectInputCurrencyMode(mode: InputCurrencyMode) {
    dispatch({ type: 'SET_INPUT_CURRENCY_MODE', payload: mode });
  }

  return (
    <SendFlowContext.Provider value={{ state, selectAsset, selectInputCurrencyMode }}>
      {children}
    </SendFlowContext.Provider>
  );
}

export function useSendFlowContext() {
  const context = useContext(SendFlowContext);
  if (!context) {
    throw new Error('useSendFlowContext must be used within SendFlowProvider');
  }
  return context;
}
