import { useFlags } from '@app/features/feature-flags';

import { Home as HomeCurrent } from './home';
import { HomeLegacy } from './home-legacy';

export function Home() {
  const { extensionRevamp } = useFlags();
  return !extensionRevamp ? <HomeCurrent /> : <HomeLegacy />;
}
