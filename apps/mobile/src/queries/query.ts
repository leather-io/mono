// import { PERSISTENCE_CACHE_TIME } from '@leather.io/constants';
import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1,
    },
  },
});
