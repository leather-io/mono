import { QueryClient } from '@tanstack/react-query';

export interface QueryClientService {
  getQueryClient(): QueryClient;
}
