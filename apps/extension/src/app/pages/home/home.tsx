import { useFlags } from '@app/features/feature-flags';

import { HomeV1 } from './home-v1';
import { HomeV2 } from './home-v2';

export function Home() {
  const { extension_revamp } = useFlags();
  return extension_revamp ? <HomeV2 /> : <HomeV1 />;
}
