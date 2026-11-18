import { type ProviderId } from '~/data/data';
import { typedKeys } from '~/utils/typed-keys';

import { type ProtocolSlug, ProtocolSlugToIdMap } from './types-preset-protocols';

export function getProtocolSlugByProviderId(providerId: ProviderId): ProtocolSlug | null {
  return (
    typedKeys(ProtocolSlugToIdMap).find(slug => providerId === ProtocolSlugToIdMap[slug]) ?? null
  );
}
