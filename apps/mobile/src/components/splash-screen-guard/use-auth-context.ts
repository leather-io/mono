import { createContext, useContext } from 'react';

interface AuthContextValue {
  lockApp(): void;
}

export const AuthContext = createContext<AuthContextValue | null>(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("'useAuthContext' must be used within an 'AuthContext.Provider'");
  return context;
};
