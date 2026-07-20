export const persistWhitelist = [
  'accounts',
  'policy',
  'active',
  'chains',
  'softwareKeys',
  'appPermissions',
  'networks',
  'settings',
  'wallets',
  'keychains',
  'manageTokens',
] as const;

export type PersistedSliceKey = (typeof persistWhitelist)[number];
