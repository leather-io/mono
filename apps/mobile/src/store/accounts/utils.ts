import { AvatarIcon } from '@/components/avatar-icon';
import { WalletStore } from '@/store/wallets/utils';
import z from 'zod';

export type AccountStatus = 'active' | 'hidden';

export const accountStoreSchema = z.object({
  id: z.string(),
  icon: z.string(),
  name: z.string(),
  status: z.string(),
  type: z.string().optional(),
  fingerprint: z.string().optional(),
  accountIndex: z.number().optional(),
});
export interface AccountStore {
  id: string;
  icon: string | AvatarIcon;
  name: string;
  status: AccountStatus;
  type?: WalletStore['type'];
  fingerprint?: string;
  accountIndex?: number;
}
