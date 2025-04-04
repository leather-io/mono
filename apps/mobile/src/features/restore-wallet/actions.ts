export type Action =
  | { type: 'SET_RECOVERY_MNEMONIC'; payload: string }
  | { type: 'SET_BUTTON_DISABLED'; payload: boolean }
  | { type: 'SET_PASSPHRASE'; payload: string }
  | { type: 'SET_ERROR'; payload: string }
  | { type: 'CLEAR_ERROR' };

export function setRecoveryMnemonic(payload: string): Action {
  return { type: 'SET_RECOVERY_MNEMONIC', payload };
}

export function setError(payload: string): Action {
  return { type: 'SET_ERROR', payload };
}

export function clearError(): Action {
  return { type: 'CLEAR_ERROR' };
}

export function setButtonDisabled(payload: boolean): Action {
  return { type: 'SET_BUTTON_DISABLED', payload };
}

export function setPassphrase(payload: string): Action {
  return { type: 'SET_PASSPHRASE', payload };
}
