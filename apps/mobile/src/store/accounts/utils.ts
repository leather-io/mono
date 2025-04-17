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
];

export type AccountIcon = (typeof accountIcons)[number];
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
