import { ReactNode, createContext, useCallback, useContext, useEffect, useState } from 'react';
import { AnimatedRef, useAnimatedRef } from 'react-native-reanimated';

import { useScreenScroll } from '@/components/screen/use-screen-scroll';
import { TabLayoutContext } from '@/features/navigation/tab-layout-context';
import { useIsFocused } from '@react-navigation/native';
import { usePathname } from 'expo-router';

type ScreenScrollContextValue = ReturnType<typeof useScreenScroll> & {
  scrollRef: AnimatedRef<any>;
  registerScrollTarget(): void;
};

const ScreenScrollContext = createContext<ScreenScrollContextValue | null>(null);

interface ScreenScrollProviderProps {
  children: ReactNode;
}

export function ScreenScrollProvider({ children }: ScreenScrollProviderProps) {
  const scrollRef = useAnimatedRef();
  const [hasRegisteredTarget, setHasRegisteredTarget] = useState(false);
  const pathname = usePathname();
  const isFocused = useIsFocused();
  const tabLayoutContext = useContext(TabLayoutContext);

  const registerScrollTarget = useCallback(() => setHasRegisteredTarget(true), []);

  const scrollBag = useScreenScroll({ enableHeaderAnimation: hasRegisteredTarget, scrollRef });

  useEffect(() => {
    if (!tabLayoutContext || !isFocused) return;
    const tabName = getTabFromPathname(pathname);
    if (!tabName) return;
    return tabLayoutContext.registerScrollRef(tabName, scrollRef);
  }, [tabLayoutContext, isFocused, pathname, scrollRef]);

  return (
    <ScreenScrollContext.Provider value={{ ...scrollBag, registerScrollTarget, scrollRef }}>
      {children}
    </ScreenScrollContext.Provider>
  );
}

export function useScreenScrollContext() {
  const context = useContext(ScreenScrollContext);
  if (!context) {
    throw new Error("'useScreenScrollContext' must be used within 'ScreenScrollProvider'");
  }
  return context;
}

function getTabFromPathname(pathname: string): string | null {
  if (pathname.startsWith('/activity')) return 'activity';
  return '(index)';
}
