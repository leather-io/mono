import { Outlet, data } from 'react-router';

import { Box } from 'leather-styles/jsx';

import { PlaygroundDock } from './components/playground-dock';
import { playgroundEnabled } from './playground.constants';

// Gate the entire /playground/* area: when disabled (production deploy),
// every route under this layout 404s, even on direct URL entry.
export function loader() {
  if (!playgroundEnabled) throw data('Not found', { status: 404 });
  return null;
}

// Chromeless shell for /playground/*: the area IS the screen — it may render
// anything up to a full app surface — so the playground adds no visible
// structure of its own. All navigation lives in the floating dock.
export default function PlaygroundLayout() {
  return (
    <Box minHeight="100vh">
      <Outlet />
      <PlaygroundDock />
    </Box>
  );
}
