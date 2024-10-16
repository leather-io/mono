import BigNumber from 'bignumber.js';
import { describe, expect, it } from 'vitest';

import { Money } from '@leather.io/models';
import { createMoney } from '@leather.io/utils';

import { AccountBalanceStxKeys } from '../hiro-api-types';
import { createStxCryptoAssetBalance } from './create-stx-crypto-asset-balance';

describe('createStxCryptoAssetBalance', () => {
  const createStxMoney = (values: Partial<Record<AccountBalanceStxKeys, string>>) => {
    const defaultValues: Record<AccountBalanceStxKeys, string> = {
      balance: '0',
      total_sent: '0',
      total_received: '0',
      locked: '0',
      total_fees_sent: '0',
      total_miner_rewards_received: '0',
    };
    return Object.fromEntries(
      Object.entries({ ...defaultValues, ...values }).map(([key, value]) => [
        key,
        { amount: new BigNumber(value), symbol: 'STX' } as Money,
      ])
    ) as Record<AccountBalanceStxKeys, Money>;
  };

  it('should calculate balances correctly', () => {
    const stxMoney = createStxMoney({
      balance: '1000',
      locked: '200',
    });
    const inboundBalance = createMoney(50, 'STX');
    const outboundBalance = createMoney(30, 'STX');

    const result = createStxCryptoAssetBalance(stxMoney, inboundBalance, outboundBalance);

    expect(result.totalBalance.amount.toNumber()).toBe(1000);
    expect(result.lockedBalance.amount.toNumber()).toBe(200);
    expect(result.unlockedBalance.amount.toNumber()).toBe(800);
    expect(result.availableBalance.amount.toNumber()).toBe(970);
    expect(result.availableUnlockedBalance.amount.toNumber()).toBe(770);
    expect(result.inboundBalance.amount.toNumber()).toBe(50);
    expect(result.outboundBalance.amount.toNumber()).toBe(30);
    expect(result.pendingBalance.amount.toNumber()).toBe(1020);
  });

  it('should handle zero balances', () => {
    const stxMoney = createStxMoney({});
    const inboundBalance = createMoney(0, 'STX');
    const outboundBalance = createMoney(0, 'STX');

    const result = createStxCryptoAssetBalance(stxMoney, inboundBalance, outboundBalance);

    expect(result.totalBalance.amount.toNumber()).toBe(0);
    expect(result.lockedBalance.amount.toNumber()).toBe(0);
    expect(result.unlockedBalance.amount.toNumber()).toBe(0);
    expect(result.availableBalance.amount.toNumber()).toBe(0);
    expect(result.availableUnlockedBalance.amount.toNumber()).toBe(0);
    expect(result.inboundBalance.amount.toNumber()).toBe(0);
    expect(result.outboundBalance.amount.toNumber()).toBe(0);
    expect(result.pendingBalance.amount.toNumber()).toBe(0);
  });

  it('should handle large numbers', () => {
    const stxMoney = createStxMoney({
      balance: '9007199254740991',
      locked: '1000000000000000',
    });
    const inboundBalance = createMoney(1000000000000000, 'STX');
    const outboundBalance = createMoney(500000000000000, 'STX');

    const result = createStxCryptoAssetBalance(stxMoney, inboundBalance, outboundBalance);

    expect(result.totalBalance.amount.toString()).toBe('9007199254740991');
    expect(result.lockedBalance.amount.toString()).toBe('1000000000000000');
    expect(result.unlockedBalance.amount.toString()).toBe('8007199254740991');
    expect(result.availableBalance.amount.toString()).toBe('8507199254740991');
    expect(result.availableUnlockedBalance.amount.toString()).toBe('7507199254740991');
    expect(result.inboundBalance.amount.toString()).toBe('1000000000000000');
    expect(result.outboundBalance.amount.toString()).toBe('500000000000000');
    expect(result.pendingBalance.amount.toString()).toBe('9507199254740991');
  });

  // TODO: check if this is correct and if we should show negative values
  it('should handle outbound balance greater than total balance', () => {
    const stxMoney = createStxMoney({
      balance: '1000',
      locked: '200',
    });
    const inboundBalance = createMoney(50, 'STX');
    const outboundBalance = createMoney(1200, 'STX');

    const result = createStxCryptoAssetBalance(stxMoney, inboundBalance, outboundBalance);

    expect(result.availableBalance.amount.toNumber()).toBe(-200);
    expect(result.availableUnlockedBalance.amount.toNumber()).toBe(-400);
    expect(result.pendingBalance.amount.toNumber()).toBe(-150);
  });
});
