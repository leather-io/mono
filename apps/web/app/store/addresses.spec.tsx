// @vitest-environment jsdom
import { act } from 'react';
import { createRoot } from 'react-dom/client';

import { useDetectLeatherProvider, useLeatherConnect } from './addresses';

const { walletMock } = vi.hoisted(() => {
  const state = { selectedWalletId: null as string | null };
  return {
    walletMock: {
      state,
      leatherProviderId: 'LeatherProvider',
      getConnectedWalletId: vi.fn(() => state.selectedWalletId),
      markLeatherAsSelectedWallet: vi.fn(() => {
        state.selectedWalletId = 'LeatherProvider';
      }),
      connectWallet: vi.fn(),
      disconnectWallet: vi.fn(),
      revokeWalletPermissions: vi.fn(),
    },
  };
});

vi.mock('~/utils/wallet', () => walletMock);

vi.mock('~/utils/utils', () => ({
  isAnyWalletInstalled: () => true,
  whenExtensionState: () => () => undefined,
}));

vi.mock('~/utils/analytics/analytics', () => ({
  analytics: { untypedTrack: vi.fn(), track: vi.fn() },
}));

vi.mock('~/utils/leather-sdk', () => ({
  leather: {},
}));

vi.mock('~/features/toasts/use-toast', () => ({
  useToast: () => ({ success: vi.fn(), error: vi.fn(), info: vi.fn() }),
}));

vi.mock('./stacks-network', () => ({
  useStacksNetwork: () => ({ network: { chainId: 0 } }),
}));

function Probe() {
  useDetectLeatherProvider();
  const { isLeatherWallet } = useLeatherConnect();
  return <span>{isLeatherWallet ? 'leather' : 'not-leather'}</span>;
}

beforeAll(() => {
  Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);
});

describe('useLeatherConnect isLeatherWallet reactivity', () => {
  test('legacy sessions without a stored provider id become leather-gated after mount', () => {
    localStorage.setItem(
      'addresses',
      JSON.stringify([
        { symbol: 'STX', address: 'SP2J6ZY48GV1EZ5V2V5RB9MP66SW86PYKKNRV9EJ7', kind: 'single-sig' },
      ])
    );

    const container = document.createElement('div');
    document.body.appendChild(container);
    const root = createRoot(container);

    act(() => {
      root.render(<Probe />);
    });

    expect(walletMock.markLeatherAsSelectedWallet).toHaveBeenCalled();
    expect(container.textContent).toBe('leather');

    act(() => {
      root.unmount();
    });
    container.remove();
  });
});
