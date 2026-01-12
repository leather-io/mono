import { useMemo } from 'react';

import { asyncWithLDProvider, useFlags as useLDFlags } from 'launchdarkly-react-client-sdk';

import { getClientId } from '@app/common/client-id';

function NoopProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

// Demo mode provider: all flags enabled, bypasses LaunchDarkly
function DemoModeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function createLDProvider() {
  // Demo mode: bypass LD, enable all flags (set DEMO_MODE=true in CI for demo builds)
  if (process.env.DEMO_MODE === 'true') return DemoModeProvider;

  if (!process.env.LAUNCH_DARKLY_KEY) return NoopProvider;

  return asyncWithLDProvider({
    clientSideID: process.env.LAUNCH_DARKLY_KEY ?? '',
    options: {
      application: {
        id: 'leather-extension-wallet',
        version: VERSION,
      },
    },
    context: {
      kind: 'clientId',
      key: getClientId(),
    },
    reactOptions: { useCamelCaseFlagKeys: true },
  });
}

interface FeatureFlags {
  releaseOnramperBuy: boolean;
  releaseOnramperSell: boolean;
  extensionRevamp: boolean;
}

export function useFlags() {
  const ldFlags = useLDFlags<FeatureFlags>();

  // In demo mode, override all flags to true
  return useMemo(() => {
    if (process.env.DEMO_MODE === 'true') {
      return {
        releaseOnramperBuy: true,
        releaseOnramperSell: true,
        extensionRevamp: true,
      } as FeatureFlags;
    }
    return ldFlags;
  }, [ldFlags]);
}
