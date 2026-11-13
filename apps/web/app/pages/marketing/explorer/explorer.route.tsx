import { marketingHeaders, marketingMeta } from '~/pages/marketing/shared/marketing-meta';
import { type RouteHandle } from '~/utils/route-handle';

import { ExplorerPage } from './explorer-page';

// Opened inside the Leather mobile app's in-app browser: a bare column, no nav or footer.
export const handle = { chrome: 'none' } satisfies RouteHandle;

export const headers = marketingHeaders;

export function meta() {
  return marketingMeta({ title: 'Leather', path: '/explorer' });
}

export default function ExplorerRoute() {
  return <ExplorerPage />;
}
