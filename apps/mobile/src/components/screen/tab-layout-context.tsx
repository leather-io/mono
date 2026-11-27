import { type ReactNode, createContext, useCallback, useContext, useMemo, useRef } from 'react';
import { runOnUI, scrollTo } from 'react-native-reanimated';

import { type ScreenScrollRef } from '@/components/screen/screen-scroll-ref';

interface TabLayoutContextValue {
  tabBarHeight: number;
  registerScrollRef(tabName: string, ref: ScreenScrollRef): () => void;
  scrollToTop(tabName: string): void;
}

export const TabLayoutContext = createContext<TabLayoutContextValue | null>(null);

interface TabLayoutProviderProps {
  children: ReactNode;
  tabBarHeight: number;
}

export function TabLayoutProvider({ children, tabBarHeight }: TabLayoutProviderProps) {
  const scrollRefs = useRef(new Map<string, ScreenScrollRef>());

  const registerScrollRef = useCallback((tabName: string, ref: ScreenScrollRef) => {
    scrollRefs.current.set(tabName, ref);
    return () => {
      scrollRefs.current.delete(tabName);
    };
  }, []);

  const scrollToTop = useCallback((tabName: string) => {
    const ref = scrollRefs.current.get(tabName);
    if (!ref) return;
    runOnUI(() => {
      'worklet';
      scrollTo(ref, 0, 0, true);
    })();
  }, []);

  const value = useMemo(
    () => ({ tabBarHeight, registerScrollRef, scrollToTop }),
    [tabBarHeight, registerScrollRef, scrollToTop]
  );

  return <TabLayoutContext.Provider value={value}>{children}</TabLayoutContext.Provider>;
}

export function useTabLayoutContext() {
  const context = useContext(TabLayoutContext);
  if (!context)
    throw new Error("'useTabLayoutContext' must be used within an 'TabLayout.Provider'");
  return context;
}
