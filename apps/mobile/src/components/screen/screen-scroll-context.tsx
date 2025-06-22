import { ReactNode, createContext, useContext } from 'react';
import { AnimatedRef, useAnimatedRef } from 'react-native-reanimated';

import { useScreenScroll } from '@/components/screen/use-screen-scroll';

type ScreenScrollContextValue = ReturnType<typeof useScreenScroll> & {
  scrollRef: AnimatedRef<any>;
};

const ScreenScrollContext = createContext<ScreenScrollContextValue | null>(null);

interface ScreenScrollProviderProps {
  enableHeaderScrollAnimation?: boolean;
  children: ReactNode;
}

export function ScreenScrollProvider({
  enableHeaderScrollAnimation,
  children,
}: ScreenScrollProviderProps) {
  const scrollRef = useAnimatedRef();

  const { scrollY, scrollHandler, debouncedFixScroll, animationTargetHeight, headerVisibility } =
    useScreenScroll({ enableHeaderAnimation: enableHeaderScrollAnimation, scrollRef });

  return (
    <ScreenScrollContext.Provider
      value={{
        scrollY,
        scrollHandler,
        debouncedFixScroll,
        animationTargetHeight,
        headerVisibility,
        scrollRef,
      }}
    >
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
