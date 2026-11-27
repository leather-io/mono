type BroadcastChain = 'bitcoin' | 'stacks';

interface E2eState {
  activeScenarios: string;
  walletRequested: boolean;
  acceptedBroadcasts: number;
  latestBroadcast: string;
}

export interface WalletAccount {
  walletIndex: number;
  accountIndex: number;
}

export interface AccountDirectory {
  bitcoinAccountOf(extendedPublicKey: string): WalletAccount | null;
  stacksAccountOf(address: string): WalletAccount | null;
}

const directory: { current: AccountDirectory | null } = { current: null };

export function registerAccountDirectory(accounts: AccountDirectory) {
  directory.current = accounts;
}

export function readAccountDirectory() {
  return directory.current;
}

const listeners = new Set<() => void>();
const holder: { state: E2eState } = {
  state: {
    activeScenarios: 'baseline',
    walletRequested: false,
    acceptedBroadcasts: 0,
    latestBroadcast: '',
  },
};

function publish(state: E2eState) {
  holder.state = state;
  listeners.forEach(listener => listener());
}

export function readE2eState() {
  return holder.state;
}

export function subscribeE2eState(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function publishScenarios(activeScenarios: string, walletRequested: boolean) {
  publish({
    ...holder.state,
    activeScenarios,
    walletRequested: holder.state.walletRequested || walletRequested,
  });
}

export function resetBroadcasts() {
  publish({ ...holder.state, acceptedBroadcasts: 0, latestBroadcast: '' });
}

export function recordBroadcast(chain: BroadcastChain, txid: string) {
  publish({
    ...holder.state,
    acceptedBroadcasts: holder.state.acceptedBroadcasts + 1,
    latestBroadcast: `${chain} ${txid}`,
  });
}

export function describeBroadcasts({ acceptedBroadcasts, latestBroadcast }: E2eState) {
  if (acceptedBroadcasts === 0) return '0';
  return `${acceptedBroadcasts} ${latestBroadcast}`;
}

export function takeWalletRequest() {
  if (!holder.state.walletRequested) return false;
  publish({ ...holder.state, walletRequested: false });
  return true;
}
