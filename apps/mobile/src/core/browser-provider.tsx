import { createContext, useContext, useRef } from 'react';

import { HasChildren } from '@leather.io/ui/native';

export interface LinkingRef {
  openURL(url: string): void;
}

interface BrowserContextValue {
  linkingRef: React.RefObject<LinkingRef | null>;
}

const BrowserContext = createContext<BrowserContextValue | null>(null);

export function useBrowser() {
  const context = useContext(BrowserContext);
  if (!context) throw new Error('`useBrowser` must be used within ``');
  return context;
}

export function BrowserProvider({ children }: HasChildren) {
  const linkingRef = useRef<LinkingRef>(null);

  return <BrowserContext.Provider value={{ linkingRef }}>{children}</BrowserContext.Provider>;
}
