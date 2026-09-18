import { type ReactNode, act } from 'react';
import { createRoot } from 'react-dom/client';

import { screen, fireEvent as testingFireEvent, waitFor } from '@testing-library/react';
import { Tooltip } from 'radix-ui';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { buildUnsignedMultisigBtcTransfer } from '~/features/multisig/transactions/build-btc-transfer';
import { buildUnsignedMultisigStxTransfer } from '~/features/multisig/transactions/build-stx-transfer';
import { useVaultBtcCustomFee } from '~/features/multisig/transactions/use-vault-btc-custom-fee';

import { stxAsset } from '@leather.io/constants';
import type { AuthNetworkId, VaultAccount } from '@leather.io/models';
import { createMoney, getAssetId, serializeAssetId } from '@leather.io/utils';

import { ProposeTransactionModal } from './propose-transaction-modal';

const mounted: { root: ReturnType<typeof createRoot>; container: HTMLElement }[] = [];
const feeEstimatesState = vi.hoisted(() => ({
  available: true,
  isFetching: false,
  isPaused: false,
  failureMessage: '',
  refetch: vi.fn(),
}));
const fireEvent = {
  change(element: HTMLElement, event: { target: { value: string } }) {
    act(() => {
      testingFireEvent.change(element, event);
    });
  },
  click(element: HTMLElement) {
    act(() => {
      testingFireEvent.click(element);
    });
  },
};

function render(children: ReactNode) {
  const container = document.createElement('div');
  document.body.appendChild(container);
  const root = createRoot(container);
  act(() => root.render(<Tooltip.Provider>{children}</Tooltip.Provider>));
  mounted.push({ root, container });
}

vi.mock('@leather.io/bitcoin', () => ({
  isValidBitcoinNetworkAddress(address: string) {
    return address.startsWith('bc1q');
  },
}));
vi.mock('@leather.io/services', () => ({
  getErrorDetail() {
    return undefined;
  },
}));
vi.mock('~/features/multisig/network/normalize-btc-address', () => ({
  normalizeNativeSegwitAddress(address: string) {
    return address;
  },
}));

vi.mock('@leather.io/ui', async importOriginal => ({
  ...(await importOriginal<typeof import('@leather.io/ui')>()),
  Sheet({ children }: { children: ReactNode }) {
    return <>{children}</>;
  },
}));
vi.mock('./asset-selector', () => ({
  AssetSelectorSheet() {
    return null;
  },
  AssetSelectorToggle() {
    return <span>STX</span>;
  },
}));
vi.mock('~/features/multisig/assets/use-vault-account-assets', () => ({
  useVaultAccountAssets() {
    return {
      isPending: false,
      items: [
        {
          id: serializeAssetId(getAssetId(stxAsset)),
          asset: stxAsset,
          crypto: createMoney(100000000, 'STX'),
          fiat: createMoney(0, 'USD'),
        },
      ],
    };
  },
}));
vi.mock('~/features/multisig/vaults/use-vault-account-balance', () => ({
  useVaultAccountBalance() {
    return { crypto: createMoney(100000000, 'BTC') };
  },
}));
vi.mock('~/queries/market-data/market-data.query', () => ({
  useMarketDataQuery() {
    return {};
  },
}));
vi.mock('~/features/toasts/use-toast', () => ({
  useToast() {
    return { error: vi.fn() };
  },
}));
vi.mock('~/features/multisig/transactions/use-propose-transaction', () => ({
  useProposeTransaction() {
    return { mutate: vi.fn(), isPending: false };
  },
}));
vi.mock('~/features/multisig/transactions/build-stx-transfer', () => ({
  buildUnsignedMultisigStxTransfer: vi.fn(),
}));
vi.mock('~/features/multisig/transactions/build-btc-transfer', () => ({
  buildUnsignedMultisigBtcTransfer: vi.fn(),
}));
vi.mock('~/features/multisig/transactions/build-sip10-transfer', () => ({
  buildUnsignedMultisigSip10Transfer: vi.fn(),
}));
vi.mock('~/features/multisig/transactions/use-vault-stx-transaction-fees', () => ({
  useVaultStxTransactionFees() {
    if (!feeEstimatesState.available)
      return {
        data: undefined,
        isFetching: feeEstimatesState.isFetching,
        isPaused: feeEstimatesState.isPaused,
        error: feeEstimatesState.failureMessage
          ? new Error(feeEstimatesState.failureMessage)
          : null,
        refetch: feeEstimatesState.refetch,
      };
    return {
      data: {
        chain: 'stacks',
        minimumFee: createMoney(345, 'STX'),
        highFeeThreshold: createMoney(5000000, 'STX'),
        options: {
          low: { value: createMoney(345, 'STX') },
          standard: { value: createMoney(400, 'STX') },
          high: { value: createMoney(901, 'STX') },
        },
      },
    };
  },
}));
vi.mock('~/features/multisig/transactions/use-vault-btc-transaction-fees', () => ({
  useVaultBtcTransactionFees() {
    if (!feeEstimatesState.available)
      return {
        data: undefined,
        isFetching: feeEstimatesState.isFetching,
        isPaused: feeEstimatesState.isPaused,
        error: feeEstimatesState.failureMessage
          ? new Error(feeEstimatesState.failureMessage)
          : null,
        refetch: feeEstimatesState.refetch,
      };
    return {
      data: {
        chain: 'bitcoin',
        options: {
          low: { value: createMoney(200, 'BTC'), rate: 1 },
          standard: { value: createMoney(400, 'BTC'), rate: 2 },
          high: { value: createMoney(800, 'BTC'), rate: 4 },
        },
      },
    };
  },
}));
vi.mock('~/features/multisig/transactions/use-vault-btc-custom-fee', () => ({
  useVaultBtcCustomFee: vi.fn(),
}));

function makeAccount(network: AuthNetworkId): VaultAccount {
  return {
    id: 'account',
    vaultId: 'vault',
    name: 'Vault account',
    icon: null,
    network,
    threshold: 2,
    multisigAddress: 'sender',
    accountIndex: 0,
    createdAt: '2026-01-01T00:00:00Z',
    signers: [],
    pendingTransactionCount: 0,
    queuedTransactionCount: 0,
  };
}

function renderProposal(network: AuthNetworkId, enterDetails = true) {
  render(
    <ProposeTransactionModal
      account={makeAccount(network)}
      memberCount={3}
      isShowing
      onClose={vi.fn()}
      onProposed={vi.fn()}
    />
  );
  if (!enterDetails) return;
  fireEvent.change(screen.getByLabelText('Recipient'), {
    target: {
      value:
        network === 'stx:testnet'
          ? 'ST2CY5V39NHDPWSXMW9QDT3HC3GD6Q6XX4CFRK9AG'
          : 'bc1qjnn26le9yyuf2h7gdn9jrxsjqnp9lze9t28er6a0k44dxu7ac7ysvtxart',
    },
  });
  fireEvent.change(screen.getByPlaceholderText('0.00'), { target: { value: '0.01' } });
  fireEvent.click(screen.getByRole('button', { name: /Custom fee/ }));
}

afterEach(() => {
  mounted.splice(0).forEach(({ root, container }) => {
    act(() => root.unmount());
    container.remove();
  });
});
beforeEach(() => {
  Reflect.set(globalThis, 'IS_REACT_ACT_ENVIRONMENT', true);
  vi.clearAllMocks();
  feeEstimatesState.available = true;
  feeEstimatesState.isFetching = false;
  feeEstimatesState.isPaused = false;
  feeEstimatesState.failureMessage = '';
  vi.mocked(useVaultBtcCustomFee, { partial: true }).mockReturnValue({
    data: { fee: createMoney(250, 'BTC'), inputs: [], outputs: [], estimatedTxSize: 200 },
    isFetching: false,
    error: null,
  });
});

describe(ProposeTransactionModal.name, () => {
  test.each<AuthNetworkId>(['stx:testnet', 'btc:mainnet'])(
    'keeps presets and custom visible before estimates arrive on %s',
    network => {
      feeEstimatesState.available = false;
      renderProposal(network, false);
      const low = screen.getByRole('button', { name: /low/i });
      expect(screen.getByRole('button', { name: /standard/i })).toBeDefined();
      expect(screen.getByRole('button', { name: /high/i })).toBeDefined();
      expect(screen.getAllByText('—')).toHaveLength(3);
      expect(screen.getByRole('status').textContent).toContain(
        'Enter a valid recipient and amount'
      );
      fireEvent.click(screen.getByRole('button', { name: /Custom fee/ }));
      expect(screen.getByRole('group', { name: 'Network fee options' }).contains(low)).toBe(true);
      fireEvent.click(low);
      expect(low.getAttribute('aria-pressed')).toBe('true');
      expect(screen.queryByLabelText(/Custom fee/)).toBeNull();
      expect(
        screen.getByRole('button', { name: 'Propose transaction' }).hasAttribute('disabled')
      ).toBe(true);
    }
  );

  test.each<AuthNetworkId>(['stx:testnet', 'btc:mainnet'])(
    'shows a failed estimate and lets the user retry on %s',
    network => {
      feeEstimatesState.available = false;
      feeEstimatesState.failureMessage = 'Fee service unavailable';
      renderProposal(network);
      expect(screen.getAllByText('Unavailable')).toHaveLength(3);
      expect(screen.getByRole('status').textContent).toContain('Fee service unavailable');
      fireEvent.click(screen.getByRole('button', { name: 'Retry fee estimates' }));
      expect(feeEstimatesState.refetch).toHaveBeenCalledOnce();
    }
  );

  test('shows loading only while an estimate request is running', () => {
    feeEstimatesState.available = false;
    feeEstimatesState.isFetching = true;
    renderProposal('stx:testnet');
    expect(screen.getAllByText('Estimating…')).toHaveLength(3);
    expect(screen.queryByRole('button', { name: 'Retry fee estimates' })).toBeNull();
  });

  test('explains when the request is paused by an offline connection', () => {
    feeEstimatesState.available = false;
    feeEstimatesState.isPaused = true;
    renderProposal('stx:testnet');
    expect(screen.getAllByText('Offline')).toHaveLength(3);
    expect(screen.getByRole('status').textContent).toContain('Check your connection');
  });

  test('does not show loading when an excessive amount prevents estimation', () => {
    feeEstimatesState.available = false;
    renderProposal('stx:testnet');
    fireEvent.change(screen.getAllByPlaceholderText('0.00')[0], { target: { value: '101' } });
    expect(screen.getAllByText('—')).toHaveLength(3);
    expect(screen.getByText('Amount exceeds available balance')).toBeDefined();
  });

  test('blocks a Stacks fee below the minimum and submits the exact custom fee', async () => {
    renderProposal('stx:testnet');
    const input = screen.getByLabelText('Custom fee (STX)');
    expect(screen.getByRole('button', { name: /low/i }).textContent).toContain('0.000345');
    expect(screen.getByRole('button', { name: /standard/i }).textContent).toContain('0.0004');
    expect(screen.getByRole('button', { name: /high/i }).textContent).toContain('0.000901');
    const submit = screen.getByRole('button', { name: 'Propose transaction' });
    expect(submit.hasAttribute('disabled')).toBe(true);
    fireEvent.change(input, { target: { value: '0.000344' } });
    expect(screen.getByRole('alert').textContent).toContain('at least 0.000345 STX');
    expect(submit.hasAttribute('disabled')).toBe(true);
    fireEvent.change(input, { target: { value: '0.000345' } });
    expect(submit.hasAttribute('disabled')).toBe(false);
    fireEvent.click(submit);
    await waitFor(() => expect(buildUnsignedMultisigStxTransfer).toHaveBeenCalledOnce());
    expect(vi.mocked(buildUnsignedMultisigStxTransfer).mock.calls[0][0].fee?.amount.toFixed()).toBe(
      '345'
    );
  });

  test('warns above 5 STX and clears the warning when a preset is selected', () => {
    renderProposal('stx:testnet');
    const input = screen.getByLabelText('Custom fee (STX)');
    fireEvent.change(input, { target: { value: '5' } });
    expect(screen.queryByRole('alert')).toBeNull();
    fireEvent.change(input, { target: { value: '5.000001' } });
    expect(screen.getByRole('alert').textContent).toContain('This fee exceeds');
    expect(
      screen.getByRole('button', { name: 'Propose transaction' }).hasAttribute('disabled')
    ).toBe(false);
    fireEvent.click(screen.getByRole('button', { name: /standard/i }));
    expect(screen.queryByLabelText('Custom fee (STX)')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  test('submits a fractional custom Bitcoin rate', async () => {
    renderProposal('btc:mainnet');
    const input = screen.getByLabelText('Custom fee rate (sat/vB)');
    fireEvent.change(input, { target: { value: '1.25' } });
    fireEvent.click(screen.getByRole('button', { name: 'Propose transaction' }));
    await waitFor(() => expect(buildUnsignedMultisigBtcTransfer).toHaveBeenCalledOnce());
    expect(vi.mocked(buildUnsignedMultisigBtcTransfer).mock.calls[0][0].feeRate).toBe(1.25);
  });

  test('blocks Bitcoin submission while the custom fee is being recalculated', () => {
    vi.mocked(useVaultBtcCustomFee, { partial: true }).mockReturnValue({
      data: { fee: createMoney(250, 'BTC'), inputs: [], outputs: [], estimatedTxSize: 200 },
      isFetching: true,
      error: null,
    });
    renderProposal('btc:mainnet');
    fireEvent.change(screen.getByLabelText('Custom fee rate (sat/vB)'), {
      target: { value: '1.25' },
    });
    expect(
      screen.getByRole('button', { name: 'Propose transaction' }).hasAttribute('disabled')
    ).toBe(true);
    expect(buildUnsignedMultisigBtcTransfer).not.toHaveBeenCalled();
  });
});
