import { ReactNode, createContext, useCallback, useContext, useState } from 'react';
import { AnimatedRef, useAnimatedRef } from 'react-native-reanimated';

import { useScreenScroll } from '@/components/screen/use-screen-scroll';

type ScreenScrollContextValue = ReturnType<typeof useScreenScroll> & {
  scrollRef: AnimatedRef<any>;
  registerScrollTarget: () => void;
};

const ScreenScrollContext = createContext<ScreenScrollContextValue | null>(null);

interface ScreenScrollProviderProps {
  children: ReactNode;
}

export function ScreenScrollProvider({ children }: ScreenScrollProviderProps) {
  const scrollRef = useAnimatedRef();
  const [hasRegisteredTarget, setHasRegisteredTarget] = useState(false);

  const registerScrollTarget = useCallback(() => setHasRegisteredTarget(true), []);

  const scrollBag = useScreenScroll({ enableHeaderAnimation: hasRegisteredTarget, scrollRef });

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
