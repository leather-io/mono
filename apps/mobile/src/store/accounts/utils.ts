import { AvatarIconName } from '@/components/avatar-icon';
import { WalletStore } from '@/store/wallets/utils';
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
  icon: AvatarIconName;
  name: string;
  status: AccountStatus;
  type?: WalletStore['type'];
}
