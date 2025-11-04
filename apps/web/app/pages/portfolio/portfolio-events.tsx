import { useEffect } from 'react';

export const bus = new EventTarget();

function emitAssetHoverOn(symbol: string) {
  bus.dispatchEvent(new CustomEvent('cursor-hover-on', { detail: { symbol } }));
}

function emitAssetHoverOff() {
  bus.dispatchEvent(new CustomEvent('cursor-hover-off'));
}

export function usePortfolioEvents(listener: (symbol: string | null) => void) {
  useEffect(() => {
    function handleHoverOn(event: Event) {
      const customEvent = event as CustomEvent;
      listener(customEvent.detail.symbol);
    }

    function handleHoverOff() {
      listener(null);
    }

    bus.addEventListener('cursor-hover-on', handleHoverOn);
    bus.addEventListener('cursor-hover-off', handleHoverOff);

    return () => {
      bus.removeEventListener('cursor-hover-on', handleHoverOn);
      bus.removeEventListener('cursor-hover-off', handleHoverOff);
    };
  }, [listener]);

  return { emitAssetHoverOn, emitAssetHoverOff };
}
