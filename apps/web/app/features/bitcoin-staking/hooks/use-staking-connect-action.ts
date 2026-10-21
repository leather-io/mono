import { useIsHydrated } from '~/hooks/use-is-hydrated';
import { useLeatherConnect } from '~/store/addresses';

export type StakingConnectAction =
  | { status: 'pending' }
  | { status: 'connected' }
  | { status: 'install'; run(): void }
  | { status: 'connect'; run(): Promise<void> };

export function useStakingConnectAction(): StakingConnectAction {
  const isHydrated = useIsHydrated();
  const { whenExtensionState, connect, setShowInstallLeatherDialog } = useLeatherConnect();

  if (!isHydrated) return { status: 'pending' };

  return whenExtensionState<StakingConnectAction>({
    connected: { status: 'connected' },
    detected: {
      status: 'connect',
      async run() {
        await connect();
      },
    },
    missing: {
      status: 'install',
      run() {
        setShowInstallLeatherDialog(true);
      },
    },
  });
}
