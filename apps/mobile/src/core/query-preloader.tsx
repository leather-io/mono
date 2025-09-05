import { ReactNode } from 'react';

import { useTotalBalance } from '@/queries/balance/total-balance.query';

interface QueryPreloaderProps {
  children: ReactNode;
}

export function QueryPreloader({ children }: QueryPreloaderProps) {
  // pre-load main queries
  useTotalBalance();

  return children;
}
