import { beforeEach, describe, expect, test, vi } from 'vitest';

import { RouteUrls } from '@shared/route-urls';

import { useProposeBtcSendTransaction } from './use-propose-btc-send-transaction';

const mocks = vi.hoisted(() => ({
  navigate: vi.fn(),
  toErrorPage: vi.fn(),
  track: vi.fn(),
  proposeMultisigTransaction: vi.fn(),
  useCurrentPolicy: vi.fn(),
}));

vi.mock('react-router', async importOriginal => {
  const actual = await importOriginal<typeof import('react-router')>();
  return { ...actual, useNavigate: () => mocks.navigate };
});

vi.mock('@shared/utils/analytics', () => ({
  analytics: { track: mocks.track },
}));

vi.mock('@app/features/multisig/use-propose-multisig-transaction', () => ({
  useProposeMultisigTransaction: () => ({
    proposeMultisigTransaction: mocks.proposeMultisigTransaction,
    isProposing: false,
  }),
}));

vi.mock('@app/store/networks/networks.selectors', () => ({
  useCurrentNetwork: () => ({ chain: { bitcoin: { mode: 'testnet' } } }),
}));

vi.mock('@app/store/policy/policy.selectors', () => ({
  useCurrentPolicy: mocks.useCurrentPolicy,
}));

vi.mock('../../hooks/use-send-form-navigate', () => ({
  useSendFormNavigate: () => ({ toErrorPage: mocks.toErrorPage }),
}));

const policyAddress = 'tb1qpolicyaddress';
const psbt = 'cHNidP8BAA==';
const summary = { symbol: 'BTC', txValue: '0.001', recipient: 'tb1qrecipient' };

describe(useProposeBtcSendTransaction.name, () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.useCurrentPolicy.mockReturnValue({ chain: 'bitcoin', address: policyAddress });
  });

  test('navigates to the sent proposal summary once the proposal is created', async () => {
    mocks.proposeMultisigTransaction.mockResolvedValue({ id: 'proposal-1' });

    await useProposeBtcSendTransaction().proposeSendTransaction(psbt, summary);

    expect(mocks.proposeMultisigTransaction).toHaveBeenCalledWith({
      network: 'btc:testnet',
      multisigAddress: policyAddress,
      rawPayload: psbt,
    });
    expect(mocks.track).toHaveBeenCalledWith('propose_multisig_transaction', { symbol: 'btc' });
    expect(mocks.navigate).toHaveBeenCalledWith(RouteUrls.SentProposalSummary, {
      state: { ...summary, proposalId: 'proposal-1' },
    });
    expect(mocks.toErrorPage).not.toHaveBeenCalled();
  });

  test('stays on the approval screen for a retry when Ledger signing is dismissed', async () => {
    mocks.proposeMultisigTransaction.mockResolvedValue(null);

    await useProposeBtcSendTransaction().proposeSendTransaction(psbt, summary);

    expect(mocks.navigate).not.toHaveBeenCalled();
    expect(mocks.toErrorPage).not.toHaveBeenCalled();
    expect(mocks.track).not.toHaveBeenCalled();
  });

  test('shows the propose error page when proposing fails', async () => {
    const error = new Error('coordinator unavailable');
    mocks.proposeMultisigTransaction.mockRejectedValue(error);

    await useProposeBtcSendTransaction().proposeSendTransaction(psbt, summary);

    expect(mocks.toErrorPage).toHaveBeenCalledWith(error, { proposeMode: true });
    expect(mocks.navigate).not.toHaveBeenCalled();
  });
});
