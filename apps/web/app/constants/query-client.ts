import { QueryClient, onlineManager } from '@tanstack/react-query';

import { getLeatherMockMode } from './environment';

const mockMode = getLeatherMockMode();
const networkMode: 'always' | undefined = mockMode ? 'always' : undefined;

if (mockMode) {
  onlineManager.setEventListener(() => () => undefined);
  onlineManager.setOnline(true);
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 60_000,
      staleTime: 300_000,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
      networkMode,
    },
  },
});
