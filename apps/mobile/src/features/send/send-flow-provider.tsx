import { ReactNode, createContext, useContext, useReducer } from 'react';

import { SendableAsset } from '@/features/send/types';
import { Account } from '@/store/accounts/accounts';
import { InputCurrencyMode } from '@/utils/types';

import { isDefined } from '@leather.io/utils';

interface SendState {
  selectedAccount: Account | null;
  selectedAsset: SendableAsset | null;
  inputCurrencyMode: InputCurrencyMode;
  accounts: Account[];
}

type Action =
  | { type: 'SET_ACCOUNT'; payload: Account }
  | { type: 'SET_ASSET'; payload: SendableAsset }
  | { type: 'SET_INPUT_CURRENCY_MODE'; payload: InputCurrencyMode }
  | { type: 'RESET' };

function reducer(state: SendState, action: Action) {
  switch (action.type) {
    case 'SET_ACCOUNT':
      return { ...state, selectedAccount: action.payload };
    case 'SET_ASSET':
      return { ...state, selectedAsset: action.payload };
    case 'SET_INPUT_CURRENCY_MODE':
      return { ...state, inputCurrencyMode: action.payload };
    default:
      return state;
  }
}

interface InitializerParams {
  accounts: Account[];
  selectedAccount?: Account;
  selectedAsset?: SendableAsset;
}

function initializer({ accounts, selectedAccount, selectedAsset }: InitializerParams): SendState {
  if (accounts.length === 1 && isDefined(accounts[0])) {
    return {
      selectedAccount: accounts[0],
      selectedAsset: null,
      inputCurrencyMode: 'crypto',
      accounts,
    };
  }

  return {
    selectedAccount: selectedAccount ?? null,
    selectedAsset: selectedAsset ?? null,
    inputCurrencyMode: 'crypto',
    accounts,
  };
}

interface SendFlowContextValue {
  state: SendState;
  selectAccount(account: Account | null): void;
  selectAsset(asset: SendableAsset | null): void;
  selectInputCurrencyMode(mode: InputCurrencyMode): void;
}

const SendFlowContext = createContext<SendFlowContextValue | null>(null);

interface SendProviderProps {
  children: ReactNode;
  initialData: {
    accounts: Account[];
    selectedAccount?: Account;
    selectedAsset?: SendableAsset;
  };
}

export function SendFlowProvider({ initialData, children }: SendProviderProps) {
  const [state, dispatch] = useReducer(reducer, initialData, initializer);

  function selectAccount(account: Account) {
    dispatch({ type: 'SET_ACCOUNT', payload: account });
  }

  function selectAsset(asset: SendableAsset) {
    dispatch({ type: 'SET_ASSET', payload: asset });
  }

  function selectInputCurrencyMode(mode: InputCurrencyMode) {
    dispatch({ type: 'SET_INPUT_CURRENCY_MODE', payload: mode });
  }

  return (
    <SendFlowContext.Provider
      value={{ state, selectAccount, selectAsset, selectInputCurrencyMode }}
    >
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
