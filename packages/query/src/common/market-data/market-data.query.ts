export const marketDataQueryOptions = {
  staleTime: 1000 * 60,
  refetchOnMount: true,
  refetchInterval: false,
  refetchOnReconnect: false,
  refetchOnWindowFocus: false,
  refetchIntervalInBackground: false,
} as const;
