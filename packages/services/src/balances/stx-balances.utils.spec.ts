import { createMoney } from '@leather.io/utils';

import {
  createTestPrincipalMempoolContractCallTx,
  createTestPrincipalMempoolTokenTransferTx,
} from '../test/transactions-fixtures';
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
      createTestPrincipalMempoolTokenTransferTx({
        token_transfer: {
          recipient: stacksAddress,
          amount: '1000000',
          memo: null,
        },
      }),
      createTestPrincipalMempoolTokenTransferTx({
        token_transfer: {
          recipient: stacksAddress,
          amount: '2000000',
          memo: null,
        },
      }),
    ];
    const balance = calculateInboundStxBalance(stacksAddress, pendingTxs);
    expect(balance).toEqual(createMoney(3000000, 'STX'));
  });

  it('should ignore transfers to other addresses', () => {
    const pendingTxs = [
      createTestPrincipalMempoolTokenTransferTx({
        token_transfer: {
          recipient: stacksAddress,
          amount: '1000000',
          memo: null,
        },
      }),
      createTestPrincipalMempoolTokenTransferTx({
        token_transfer: {
          recipient: otherStacksAddress,
          amount: '2000000',
          memo: null,
        },
      }),
    ];
    const balance = calculateInboundStxBalance(stacksAddress, pendingTxs);
    expect(balance).toEqual(createMoney(1000000, 'STX'));
  });

  it('should ignore non-transfer txs', () => {
    const pendingTxs = [
      createTestPrincipalMempoolTokenTransferTx({
        token_transfer: {
          recipient: stacksAddress,
          amount: '2500000',
          memo: null,
        },
      }),
      createTestPrincipalMempoolContractCallTx(),
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
      createTestPrincipalMempoolTokenTransferTx({
        sender: { address: stacksAddress, nonce: 0 },
        fee_rate: '50000',
        token_transfer: {
          recipient: otherStacksAddress,
          amount: '4000000',
          memo: null,
        },
      }),
      createTestPrincipalMempoolContractCallTx({
        sender: { address: stacksAddress, nonce: 0 },
        fee_rate: '75000',
      }),
    ];
    const balance = calculateOutboundStxBalance(stacksAddress, pendingTxs);
    expect(balance).toEqual(createMoney(4125000, 'STX'));
  });

  it('should ignore fees for sponsored transactions', () => {
    const pendingTxs = [
      createTestPrincipalMempoolTokenTransferTx({
        sender: { address: stacksAddress, nonce: 0 },
        fee_rate: '50000',
        token_transfer: {
          recipient: otherStacksAddress,
          amount: '4000000',
          memo: null,
        },
      }),
      createTestPrincipalMempoolContractCallTx({
        sender: { address: stacksAddress, nonce: 0 },
        fee_rate: '75000',
      }),
      createTestPrincipalMempoolContractCallTx({
        sender: { address: stacksAddress, nonce: 0 },
        fee_rate: '75000',
        sponsor: { address: otherStacksAddress, nonce: 0 },
      }),
    ];
    const balance = calculateOutboundStxBalance(stacksAddress, pendingTxs);
    expect(balance).toEqual(createMoney(4125000, 'STX'));
  });

  it('should ignore txs sent from other addresses', () => {
    const pendingTxs = [
      createTestPrincipalMempoolContractCallTx({
        sender: { address: stacksAddress, nonce: 0 },
        fee_rate: '75000',
      }),
      createTestPrincipalMempoolTokenTransferTx({
        sender: { address: otherStacksAddress, nonce: 0 },
        fee_rate: '50000',
        token_transfer: {
          recipient: stacksAddress,
          amount: '4000000',
          memo: null,
        },
      }),
      createTestPrincipalMempoolContractCallTx({
        sender: { address: otherStacksAddress, nonce: 0 },
        fee_rate: '75000',
      }),
    ];
    const balance = calculateOutboundStxBalance(stacksAddress, pendingTxs);
    expect(balance).toEqual(createMoney(75000, 'STX'));
  });
});
