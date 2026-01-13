import z from 'zod';

export const accountIcons = [
  'pizza',
  'sparkles',
  'piggyBank',
  'orange',
  'car',
  'alien',
  'saturn',
  'bank',
  'rocket',
  'folder',
  'smile',
  'code',
  'zap',
  'gift',
  'colorPalette',
  'home',
  'space',
  'box',
  'heart',
  'flag',
] as const;
export type AccountIcon = (typeof accountIcons)[number];

const accountStatuses = ['active', 'hidden'] as const;
export type AccountStatus = (typeof accountStatuses)[number];

export interface AccountStore {
  id: string;
  icon?: AccountIcon;
  name: string;
  status: AccountStatus;
}

export const accountStoreSchema = z.object({
  id: z.string(),
  icon: z.enum(accountIcons).optional(),
  name: z.string(),
  status: z.enum(accountStatuses),
}) satisfies z.ZodType<AccountStore>;

function simpleStringHash(input: string): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
}

export function deriveIconFromAccountId(accountId: string): AccountIcon {
  const hash = simpleStringHash(accountId);
  const index = hash % accountIcons.length;
  const icon = accountIcons[index];
  if (!icon) throw new Error('Failed to derive icon from account ID');
  return icon;
}
