import { useEffect } from 'react';

import { atom, useAtom } from 'jotai';

const bus = new EventTarget();

class AssetHoverOnEvent extends Event {
  constructor(readonly detail: { symbol: string }) {
    super('cursor-hover-on');
  }
}

function emitAssetHoverOn(symbol: string) {
  bus.dispatchEvent(new AssetHoverOnEvent({ symbol }));
}

function emitAssetHoverOff() {
  bus.dispatchEvent(new CustomEvent('cursor-hover-off'));
}

const hoveredSymbolAtom = atom<string | null>(null);

export function usePortfolioEvents(listener?: (symbol: string | null) => void) {
  const [hoveredSymbol, setHoveredSymbol] = useAtom(hoveredSymbolAtom);

  useEffect(() => {
    function handleHoverOn(event: Event) {
      if (!(event instanceof AssetHoverOnEvent)) return;
      const symbol = event.detail.symbol;
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
