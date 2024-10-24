import { createContext, useContext } from 'react';

interface AuthContextArgs {
  lockApp(): void;
}

export const AuthContext = createContext<AuthContextArgs>({
  lockApp: () => {},
});

export const useAuthContext = () => useContext(AuthContext);
