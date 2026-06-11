import { type ReactNode, createContext, useContext } from 'react';

const SignInSlotContext = createContext<ReactNode>(null);

interface SignInSlotProviderProps {
  slot: ReactNode;
  children: ReactNode;
}

export function SignInSlotProvider({ slot, children }: SignInSlotProviderProps) {
  return <SignInSlotContext.Provider value={slot}>{children}</SignInSlotContext.Provider>;
}

export function useSignInSlot() {
  return useContext(SignInSlotContext);
}
