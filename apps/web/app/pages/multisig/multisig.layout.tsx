import { Outlet, data } from 'react-router';

import { MultisigToastProvider } from './components/multisig-toast';
import { multisigEnabled } from './multisig.constants';
import { MultisigSessionProvider } from './store/multisig-session';

// Gate the entire /multisig/* area: when the feature is disabled (production),
// every route under this layout 404s, even on direct URL entry.
export function loader() {
  if (!multisigEnabled) throw data('Not found', { status: 404 });
  return null;
}

// Scoped layout for /multisig/*. The session + toast providers are mounted here
// so the in-memory session store and toasts are scoped to the multisig area and
// never leak into other pages.
export default function MultisigLayout() {
  return (
    <MultisigSessionProvider>
      <MultisigToastProvider>
        <Outlet />
      </MultisigToastProvider>
    </MultisigSessionProvider>
  );
}
