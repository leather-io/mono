import { describe, expect, it } from 'vitest';

import type { BitcoinTransaction } from '@leather.io/models';
import { createMarketData, createMarketPair } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import type { SbtcDeposit, SbtcStatus } from '@app/query/sbtc/sbtc-deposits.query';

import { createSbtcDepositActivity } from './sbtc-deposit-activity';

const bitcoinTxid = 'e0f1c9b2a3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e';

function createDeposit(status: SbtcStatus, amount = 150_000): SbtcDeposit {
  return {
    amount,
    bitcoinTxOutputIndex: 0,
    bitcoinTxid,
    depositScript: '0x00',
    lastUpdateBlockHash: '0x01',
    lastUpdateHeight: 1234,
    recipient: '0x0516df0ba3e79792be7be5e50a370289accfc8c9e032',
    reclaimScript: '0x02',
    status,
  };
}

function createFundingTx(overrides: Partial<BitcoinTransaction> = {}): BitcoinTransaction {
  return { txid: bitcoinTxid, vin: [], vout: [], ...overrides };
}

const marketData = createMarketData(createMarketPair('BTC', 'USD'), createMoney(100_000_00, 'USD'));

describe('createSbtcDepositActivity', () => {
  it('maps a pending deposit to a pending bitcoin send', () => {
    const activity = createSbtcDepositActivity(createDeposit('pending'), null);

    expect(activity.txid).toBe(bitcoinTxid);
    expect(activity.chain).toBe('bitcoin');
    expect(activity.action).toBe('send');
    expect(activity.status).toBe('pending');
    expect(activity.balanceChanges[0].direction).toBe('sent');
    expect(activity.balanceChanges[0].amount.crypto.amount.toString()).toBe('150000');
  });

  it('maps accepted deposits to pending, awaiting the mint', () => {
    expect(createSbtcDepositActivity(createDeposit('accepted'), null).status).toBe('pending');
  });

  it.each<SbtcStatus>(['failed', 'rbf'])('maps a %s deposit to failed', status => {
    expect(createSbtcDepositActivity(createDeposit(status), null).status).toBe('failed');
  });

  it('maps a confirmed deposit to success', () => {
    expect(createSbtcDepositActivity(createDeposit('confirmed'), null).status).toBe('success');
  });

  it('never claims the user initiated the funding transaction', () => {
    expect(createSbtcDepositActivity(createDeposit('pending'), null).initiatedByUser).toBe(false);
  });

  it('takes the timestamp and block height from the funding transaction', () => {
    const activity = createSbtcDepositActivity(
      createDeposit('failed'),
      createFundingTx({ time: 1_700_000_000, height: 870_000 })
    );

    expect(activity.timestamp).toBe(1_700_000_000);
    expect(activity.blockHeight).toBe(870_000);
  });

  it('falls back to now when the funding transaction is unknown', () => {
    const before = Math.floor(Date.now() / 1000);
    const activity = createSbtcDepositActivity(createDeposit('pending'), null);

    expect(activity.timestamp).toBeGreaterThanOrEqual(before);
    expect(activity.blockHeight).toBeUndefined();
  });

  it('leaves the quote at zero without market data', () => {
    const activity = createSbtcDepositActivity(createDeposit('pending'), null);

    expect(activity.balanceChanges[0].amount.quote.amount.toString()).toBe('0');
  });

  it('quotes the deposit amount when market data is available', () => {
    const activity = createSbtcDepositActivity(createDeposit('pending'), null, marketData);

    expect(activity.balanceChanges[0].amount.quote.amount.toString()).toBe('15000');
  });
});
