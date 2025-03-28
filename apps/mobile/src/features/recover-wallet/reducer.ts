import { InputState } from '@/components/text-input';

import { Action } from './actions';

type State = {
  recoveryMnemonic: string;
  inputState: InputState;
  errorMessage: string;
  isButtonDisabled: boolean;
  passphrase: string;
};

export const initialState: State = {
  recoveryMnemonic: '',
  inputState: 'default',
  errorMessage: '',
  isButtonDisabled: true,
  passphrase: '',
};

export function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'SET_RECOVERY_MNEMONIC':
      return { ...state, recoveryMnemonic: action.payload, inputState: 'default' };
    case 'SET_BUTTON_DISABLED':
      return { ...state, isButtonDisabled: action.payload };
    case 'SET_PASSPHRASE':
      return { ...state, passphrase: action.payload };
    case 'SET_ERROR':
      return {
        ...state,
        errorMessage: action.payload,
        inputState: 'error',
        isButtonDisabled: true,
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        errorMessage: '',
        inputState: 'default',
        isButtonDisabled: false,
      };
    default:
      return state;
  }
}
