import { describe, expect, test } from 'vitest';

import { type JourneyTransaction, createJourneyRun } from './journey-state';
import type { JourneyDefinition, JourneyStep } from './journey-types';
import { effectiveStep, journeyBalances, receiptBalances } from './journey-world';

const step: JourneyStep = {
  id: 'swap',
  kind: 'transaction',
  title: 'Swap STX for sBTC',
  primaryLabel: 'Swap',
  method: 'stx_callContract',
  chain: 'stacks',
  movements: [
    { symbol: 'STX', amount: '100', direction: 'out' },
    { symbol: 'sBTC', amount: '0.001', direction: 'in' },
  ],
  fee: { amount: '0.003', symbol: 'STX' },
};
const definition: JourneyDefinition = {
  id: 'swap',
  title: 'Swap',
  category: 'apps',
  appName: 'Demo',
  origin: 'https://app.example',
  description: 'Demo',
  goal: 'Swap',
  steps: [step],
};

function receipt(status: JourneyTransaction['status'], feePaid: boolean): JourneyTransaction {
  return { requestId: `${status}-${feePaid}`, stepIndex: 0, status, feePaid, amounts: {} };
}

describe('Journey account world', () => {
  test('keeps the receive side proportional when the editable amount changes', () => {
    const changed = effectiveStep(step, { swap: '250' });
    expect(changed.movements.map(item => item.amount)).toEqual(['250', '0.0025']);
    expect(step.movements[0]?.amount).toBe('100');
  });
  test('changes balances only for confirmed assets and actually charged fees', () => {
    const initial = createJourneyRun({
      id: 'test',
      journeyId: 'swap',
      signer: 'software',
      startedAt: 0,
    });
    const run = { ...initial, transactions: [receipt('failed', true), receipt('pending', false)] };
    expect(journeyBalances(definition, run).find(item => item.symbol === 'STX')?.amount).toBe(
      '9,999.997'
    );
    const confirmed = {
      ...initial,
      transactions: [receipt('failed', true), receipt('confirmed', true)],
    };
    expect(journeyBalances(definition, confirmed).find(item => item.symbol === 'STX')?.amount).toBe(
      '9,899.994'
    );
    expect(
      journeyBalances(definition, confirmed).find(item => item.symbol === 'sBTC')?.amount
    ).toBe('0.011');
  });
  test('includes the fee in the account-net activity summary and omits pending or failed summaries', () => {
    expect(
      receiptBalances(step, receipt('confirmed', true)).map(item => [
        item.symbol,
        item.amount,
        item.direction,
      ])
    ).toEqual([
      ['STX', '100.003', 'out'],
      ['sBTC', '0.001', 'in'],
    ]);
    expect(receiptBalances(step, receipt('pending', false))).toEqual([]);
    expect(receiptBalances(step, receipt('failed', true))).toEqual([]);
  });
});
