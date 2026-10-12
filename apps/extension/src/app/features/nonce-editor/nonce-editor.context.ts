import { createContext, useContext } from 'react';

export type Nonce = string | number;

interface NonceEditorContext {
  loadedNonce: Nonce;
  nonce: Nonce;
  onGoBack(this: void): void;
  onSetLoadedNonce(this: void, value: Nonce): void;
  onSetNonce(this: void, value: Nonce): void;
  onUserActivatesNonceEditor(this: void): void;
}

export const nonceEditorContext = createContext<NonceEditorContext | null>(null);

export function useNonceEditorContext() {
  const context = useContext(nonceEditorContext);
  if (!context)
    throw new Error('`useNonceEditorContext` must be used within a `NonceEditorProvider`');
  return context;
}
