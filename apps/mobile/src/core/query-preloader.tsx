import { ReactNode } from 'react';

import { useTotalActivity } from '@/queries/activity/account-activity.query';
import { useTotalBalance } from '@/queries/balance/total-balance.query';

interface QueryPreloaderProps {
  children: ReactNode;
}

export function QueryPreloader({ children }: QueryPreloaderProps) {
  // pre-load main queries
  useTotalBalance();
  useTotalActivity();

  return children;
}
