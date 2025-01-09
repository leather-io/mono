import { AccountIcon } from '@/features/accounts/components/account-avatar';
import z from 'zod';

export type AccountStatus = 'active' | 'hidden';

export const accountStoreSchema = z.object({
  id: z.string(),
  icon: z.string(),
  name: z.string(),
  status: z.string(),
});
export interface AccountStore {
  id: string;
  icon: AccountIcon;
  name: string;
  status: AccountStatus;
}
