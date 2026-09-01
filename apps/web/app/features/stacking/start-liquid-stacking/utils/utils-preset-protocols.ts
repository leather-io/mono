import { ProviderId } from '~/data/data';

import { ProtocolSlug, ProtocolSlugToIdMap } from './types-preset-protocols';

export function getProtocolSlugByProviderId(providerId: ProviderId): ProtocolSlug | null {
  return (
    (Object.entries(ProtocolSlugToIdMap).find(
      ([, id]) => providerId === id
    )?.[0] as ProtocolSlug) || null
  );
}
