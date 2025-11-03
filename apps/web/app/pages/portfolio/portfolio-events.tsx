import { useEffect } from 'react';

import { atom, useAtom } from 'jotai';

export const bus = new EventTarget();

function emitAssetHoverOn(symbol: string) {
  bus.dispatchEvent(new CustomEvent('cursor-hover-on', { detail: { symbol } }));
}

function emitAssetHoverOff() {
  bus.dispatchEvent(new CustomEvent('cursor-hover-off'));
}

const hoveredSymbolAtom = atom<string | null>(null);

export function usePortfolioEvents(listener?: (symbol: string | null) => void) {
  const [hoveredSymbol, setHoveredSymbol] = useAtom(hoveredSymbolAtom);

  useEffect(() => {
    function handleHoverOn(event: Event) {
      const customEvent = event as CustomEvent;
      const symbol = customEvent.detail.symbol;
      setHoveredSymbol(symbol);
      listener?.(symbol);
    }

    function handleHoverOff() {
      setHoveredSymbol(null);
      listener?.(null);
    }

    bus.addEventListener('cursor-hover-on', handleHoverOn);
    bus.addEventListener('cursor-hover-off', handleHoverOff);

    return () => {
      bus.removeEventListener('cursor-hover-on', handleHoverOn);
      bus.removeEventListener('cursor-hover-off', handleHoverOff);
    };
  }, [listener, setHoveredSymbol]);

  return { emitAssetHoverOn, emitAssetHoverOff, hoveredSymbol };
}
