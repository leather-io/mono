import type {
  MempoolTokenTransferTransaction,
  Transaction,
} from '@stacks/stacks-blockchain-api-types';
import { describe, expect, it, vi } from 'vitest';

import { createMoney } from '@leather.io/utils';

import { useMempoolTxsBalance } from './use-mempool-txs-balance';
import { useStacksConfirmedTransactions } from './use-stacks-confirmed-transactions';
import { useStacksPendingTransactions } from './use-stacks-pending-transactions';

vi.mock('../stacks/use-stacks-confirmed-transactions');

vi.mock('../stacks/use-stacks-pending-transactions');
const mockAddresses = ['SP2417H88DQFN7FNDMSKM9N0B3Q6GNGEM40W7ZAZW'];

const mockPendingTx = {
  anchor_mode: 'any',
  fee_rate: '2500',
  nonce: 175,
  post_condition_mode: 'deny',
  post_conditions: [],
  receipt_time: 1729859565,
  receipt_time_iso: '2024-10-25T12:32:45.000Z',
  sender_address: 'SP2417H88DQFN7FNDMSKM9N0B3Q6GNGEM40W7ZAZW',
  sponsored: false,
  tx_id: '0x7e1c989098a852ea2c2c1549660692ecbbdd53b83f4ecbbce24123e842e985ca',
  tx_status: 'pending',
  tx_type: 'token_transfer',
  token_transfer: {
    amount: '1000000',
    memo: '0x00000000000000000000000000000000000000000000000000000000000000000000',
    recipient_address: 'SPY0682ZM7VGPMVGQP99Z05J3QWMVV83RA6N42SA',
  },
} as MempoolTokenTransferTransaction;

describe('useMempoolTxsBalance', () => {
  it('calculates inbound balance correctly', () => {
    vi.mocked(useStacksPendingTransactions).mockReturnValue({
      transactions: [mockPendingTx],
      query: { totalData: [mockPendingTx], isPending: false },
    });

    vi.mocked(useStacksConfirmedTransactions).mockReturnValue([]);

    const result = useMempoolTxsBalance(mockAddresses);
    expect(result.inboundBalance).toEqual(createMoney(0, 'STX'));
    expect(result.outboundBalance).toEqual(createMoney(1002500, 'STX'));
  });

  it('calculates outbound balance correctly', () => {
    const outboundTx = {
      ...mockPendingTx,
      sender_address: mockAddresses[0],
      token_transfer: {
        ...mockPendingTx.token_transfer,
        recipient_address: 'SPY0682ZM7VGPMVGQP99Z05J3QWMVV83RA6N42SA',
      },
    } as MempoolTokenTransferTransaction;

    vi.mocked(useStacksPendingTransactions).mockReturnValue({
      transactions: [outboundTx],
      query: { totalData: [outboundTx], isPending: false },
    });

    vi.mocked(useStacksConfirmedTransactions).mockReturnValue([]);

    const result = useMempoolTxsBalance(mockAddresses);
    expect(result.inboundBalance).toEqual(createMoney(0, 'STX'));
    expect(result.outboundBalance).toEqual(createMoney(1002500, 'STX'));
  });

  it('filters out confirmed transactions', () => {
    const confirmedTx = {
      nonce: 175,
    } as Transaction;

    vi.mocked(useStacksPendingTransactions).mockReturnValue({
      transactions: [mockPendingTx],

      query: { totalData: [mockPendingTx], isPending: false },
    });

    vi.mocked(useStacksConfirmedTransactions).mockReturnValue([confirmedTx]);

    const result = useMempoolTxsBalance(mockAddresses);
    expect(result.inboundBalance).toEqual(createMoney(0, 'STX'));
    expect(result.outboundBalance).toEqual(createMoney(0, 'STX'));
  });
});
