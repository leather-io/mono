import {
  type ReactNode,
  createContext,
  useContext,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';

import { Box } from 'leather-styles/jsx';

const ScaleContext = createContext(1);

export function useFitScale() {
  return useContext(ScaleContext);
}

interface ScaleToFitProps {
  children: ReactNode;
  inset?: number;
  // Also fit the container's height (the container must have one: flex: 1
  // with minHeight 0, or a fixed height).
  fitHeight?: boolean;
}

export function ScaleToFit({ children, inset = 0, fitHeight = false }: ScaleToFitProps) {
  const outerRef = useRef<HTMLDivElement>(null);
  const innerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ available: 0, availableHeight: 0, width: 0, height: 0 });

  useLayoutEffect(() => {
    const outer = outerRef.current;
    const inner = innerRef.current;
    if (!outer || !inner) return;
    function measure() {
      if (!outer || !inner) return;
      setSize({
        available: outer.clientWidth,
        availableHeight: outer.clientHeight,
        width: inner.offsetWidth,
        height: inner.offsetHeight,
      });
    }
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(outer);
    observer.observe(inner);
    return () => observer.disconnect();
  }, []);

  const byWidth = size.width > 0 && size.available > 0 ? (size.available - inset) / size.width : 1;
  const byHeight =
    fitHeight && size.height > 0 && size.availableHeight > 0
      ? size.availableHeight / size.height
      : 1;
  const scale = Math.max(0.1, Math.min(1, Math.floor(Math.min(byWidth, byHeight) * 1000) / 1000));

  return (
    <Box
      ref={outerRef}
      width="100%"
      minWidth="0"
      {...(fitHeight ? { flex: '1', minHeight: '0', overflow: 'hidden' } : {})}
    >
      <Box
        mx="auto"
        position="relative"
        style={{
          width: size.width ? size.width * scale : undefined,
          height: size.height ? size.height * scale : undefined,
        }}
      >
        <Box
          ref={innerRef}
          position="absolute"
          top="0"
          left="0"
          width="max-content"
          style={{ transform: scale < 1 ? `scale(${scale})` : undefined, transformOrigin: '0 0' }}
        >
          <ScaleContext.Provider value={scale}>{children}</ScaleContext.Provider>
        </Box>
      </Box>
    </Box>
  );
}
