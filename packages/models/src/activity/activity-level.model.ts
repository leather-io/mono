export const ActivityLevels = {
  account: 'account',
  app: 'app',
} as const;
export type ActivityLevel = keyof typeof ActivityLevels;
