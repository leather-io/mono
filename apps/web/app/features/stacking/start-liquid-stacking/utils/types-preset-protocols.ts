export const ProtocolSlugToIdMap = {
  'stacking-dao': 'stackingDao',
  lisa: 'lisa',
} as const;

export type ProtocolSlug = keyof typeof ProtocolSlugToIdMap;
