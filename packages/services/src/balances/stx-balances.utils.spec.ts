import { createMoney } from '@leather.io/utils';

import {
  createBalancesContractCallTx,
  createBalancesTokenTransferTx,
} from '../test/balances-stacks-txs';
import { calculateInboundStxBalance, calculateOutboundStxBalance } from './stx-balances.utils';

const stacksAddress = 'STACKS_ADDRESS';
const otherStacksAddress = 'OTHER_STX_ADDRESS';

describe('calculateInboundStxBalance', () => {
  it('should return 0 when no pending txs', () => {
    const balance = calculateInboundStxBalance(stacksAddress, []);
    expect(balance).toEqual(createMoney(0, 'STX'));
  });

  it('should sum token transfers to the recipient address', () => {
    const pendingTxs = [
      createBalancesTokenTransferTx({
        token_transfer: {
          recipient_address: stacksAddress,
          amount: '1000000',
          memo: '',
        },
      }),
      createBalancesTokenTransferTx({
        token_transfer: {
          recipient_address: stacksAddress,
          amount: '2000000',
          memo: '',
        },
      }),
    ];
    const balance = calculateInboundStxBalance(stacksAddress, pendingTxs);
    expect(balance).toEqual(createMoney(3000000, 'STX'));
  });

  it('should ignore transfers to other addresses', () => {
    const pendingTxs = [
      createBalancesTokenTransferTx({
        token_transfer: {
          recipient_address: stacksAddress,
          amount: '1000000',
          memo: '',
        },
      }),
      createBalancesTokenTransferTx({
        token_transfer: {
          recipient_address: otherStacksAddress,
          amount: '2000000',
          memo: '',
        },
      }),
    ];
    const balance = calculateInboundStxBalance(stacksAddress, pendingTxs);
    expect(balance).toEqual(createMoney(1000000, 'STX'));
  });

  it('should ignore non-transfer txs', () => {
    const pendingTxs = [
      createBalancesTokenTransferTx({
        token_transfer: {
          recipient_address: stacksAddress,
          amount: '2500000',
          memo: '',
        },
      }),
      createBalancesContractCallTx(),
    ];
    const balance = calculateInboundStxBalance(stacksAddress, pendingTxs);
    expect(balance).toEqual(createMoney(2500000, 'STX'));
  });
});

describe('calculateOutboundStxBalance', () => {
  it('should return 0 when no pending txs', () => {
    const balance = calculateOutboundStxBalance(stacksAddress, []);
    expect(balance).toEqual(createMoney(0, 'STX'));
  });

  it('should sum transfers and fees sent from the address', () => {
    const pendingTxs = [
      createBalancesTokenTransferTx({
        sender_address: stacksAddress,
        fee_rate: '50000',
        token_transfer: {
          recipient_address: otherStacksAddress,
          amount: '4000000',
          memo: '',
        },
      }),
      createBalancesContractCallTx({
        sender_address: stacksAddress,
        fee_rate: '75000',
      }),
    ];
    const balance = calculateOutboundStxBalance(stacksAddress, pendingTxs);
    expect(balance).toEqual(createMoney(4125000, 'STX'));
  });

  it('should ignore fees for sponsored transactions', () => {
    const pendingTxs = [
      createBalancesTokenTransferTx({
        sender_address: stacksAddress,
        fee_rate: '50000',
        token_transfer: {
          recipient_address: otherStacksAddress,
          amount: '4000000',
          memo: '',
        },
      }),
      createBalancesContractCallTx({
        sender_address: stacksAddress,
        fee_rate: '75000',
      }),
      createBalancesContractCallTx({
        sender_address: stacksAddress,
        fee_rate: '75000',
        sponsored: true,
      }),
    ];
    const balance = calculateOutboundStxBalance(stacksAddress, pendingTxs);
    expect(balance).toEqual(createMoney(4125000, 'STX'));
  });

  it('should ignore txs sent from other addresses', () => {
    const pendingTxs = [
      createBalancesContractCallTx({
        sender_address: stacksAddress,
        fee_rate: '75000',
      }),
      createBalancesTokenTransferTx({
        sender_address: otherStacksAddress,
        fee_rate: '50000',
        token_transfer: {
          recipient_address: stacksAddress,
          amount: '4000000',
          memo: '',
        },
      }),
      createBalancesContractCallTx({
        sender_address: otherStacksAddress,
        fee_rate: '75000',
      }),
    ];
    const balance = calculateOutboundStxBalance(stacksAddress, pendingTxs);
    expect(balance).toEqual(createMoney(75000, 'STX'));
  });
});
