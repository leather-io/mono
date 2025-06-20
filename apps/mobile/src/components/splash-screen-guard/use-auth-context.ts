import { createContext, use } from 'react';

interface AuthContextValue {
  lockApp(): void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuthContext() {
  const context = use(AuthContext);
  if (!context) throw new Error("'useAuthContext' must be used within an 'AuthContext.Provider'");
  return context;
}
