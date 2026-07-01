import { Navigate, Outlet, data, useLocation } from 'react-router';

import { Box, Flex } from 'leather-styles/jsx';
import { useMultisigNetworks } from '~/features/multisig/auth/use-multisig-networks';
import { useSession } from '~/features/multisig/auth/use-session';
import { useSessionBootstrap } from '~/features/multisig/auth/use-session-bootstrap';
import { SignInSlotProvider } from '~/layouts/page/sign-in-slot';

import { MultisigConnectDropdown } from './components/connection-dropdown/multisig-connect-dropdown';
import { DevToolsPanel } from './components/dev-tools/dev-tools-panel';
import { NetworkModeGlow } from './components/network-mode-glow';
import { NetworkModeSwitcher } from './components/network-mode-switcher';
import { multisigEnabled, multisigPaths } from './multisig.constants';
import { MultisigSessionProvider } from './store/multisig-session';

// Gate the entire /multisig/* area: when the feature is disabled (production),
// every route under this layout 404s, even on direct URL entry.
export function loader() {
  if (!multisigEnabled) throw data('Not found', { status: 404 });
  return null;
}

// Scoped layout for /multisig/*. The session provider is mounted here so the
// in-memory session store is scoped to the multisig area and never leaks into
// other pages.
export default function MultisigLayout() {
  useSessionBootstrap();
  const location = useLocation();
  const { btc: btcNetwork, stx: stxNetwork } = useMultisigNetworks();
  const btcSession = useSession(btcNetwork);
  const stxSession = useSession(stxNetwork);

  if (!btcSession && !stxSession && location.pathname !== multisigPaths.onboarding) {
    return <Navigate to={multisigPaths.onboarding} replace />;
  }

  return (
    <SignInSlotProvider
      slot={
        <Flex gap="space.02" alignItems="center">
          <NetworkModeSwitcher />
          <MultisigConnectDropdown />
        </Flex>
      }
    >
      <MultisigSessionProvider>
        <NetworkModeGlow />
        <Box pb="space.11">
          <Outlet />
        </Box>
        <DevToolsPanel />
      </MultisigSessionProvider>
    </SignInSlotProvider>
  );
}
