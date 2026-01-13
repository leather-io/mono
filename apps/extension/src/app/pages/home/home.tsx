import { useFlags } from '@app/features/feature-flags';

import { Home as HomeCurrent } from './home-current';
import { HomeLegacy } from './home-legacy';

export function Home() {
  const { extensionRevamp } = useFlags();

  //   collectibles loads but looks crap. need to have send ordinals
  //   smaller PR quicker merge though so leave it out

  //   - test collectibles UI and UX and make it look good faster

  return extensionRevamp ? <HomeCurrent /> : <HomeLegacy />;
}
