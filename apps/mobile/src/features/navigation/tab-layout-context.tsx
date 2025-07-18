import { createContext, useContext } from 'react';

interface TabLayoutContextValue {
  tabBarHeight: number;
  // setTabBarHeight(val: number): void;
}

export const TabLayoutContext = createContext<TabLayoutContextValue | null>(null);

export function useTabLayoutContext() {
  const context = useContext(TabLayoutContext);
  if (!context)
    throw new Error("'useTabLayoutContext' must be used within an 'TabLayout.Provider'");
  return context;
}
