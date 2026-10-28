import BigNumber from 'bignumber.js';

import type { ActivityListBalance } from '../scenarios/activity-list-fixtures';
import { findJourneyDefinition } from './journey-definitions';
import type { JourneyRun, JourneyTransaction } from './journey-state';
import type { JourneyDefinition, JourneyMovement, JourneyStep } from './journey-types';

const openingBalances = [
  { symbol: 'BTC', amount: '0.0842153' },
  { symbol: 'STX', amount: '10000' },
  { symbol: 'sBTC', amount: '0.01' },
  { symbol: 'USDCx', amount: '500' },
];
const demoPrices: Record<string, number> = { BTC: 109778, STX: 0.8124, sBTC: 109778, USDCx: 1 };

export function resolveJourney(id: string): JourneyDefinition | undefined {
  const [definitionId, variantId] = id.split(':');
  const definition = findJourneyDefinition(definitionId ?? '');
  if (!definition) return undefined;
  const variant = definition.variants?.find(item => item.id === variantId);
  return variant
    ? { ...definition, title: `${definition.title} · ${variant.label}`, steps: variant.steps }
    : definition;
}

export function effectiveStep(step: JourneyStep, amounts: Record<string, string>): JourneyStep {
  const recipient = amounts['field:recipient'] ?? step.recipient;
  const name = amounts['field:name'] ?? step.name;
  const withFields = {
    ...step,
    recipient,
    name,
    title: step.name && name ? step.title.replace(step.name, name) : step.title,
  };
  const proposalAmount =
    step.kind === 'sign' || step.kind === 'broadcast' ? amounts.propose : undefined;
  const amount = amounts[step.id] ?? proposalAmount;
  if (!amount) return withFields;
  const initial = step.movements[0];
  if (!initial) return step;
  const base = new BigNumber(initial.amount.replaceAll(',', ''));
  const replacement = new BigNumber(amount.replaceAll(',', ''));
  if (!base.isPositive() || !replacement.isPositive() || !replacement.isFinite()) return step;
  const ratio = replacement.dividedBy(base);
  return {
    ...withFields,
    title: withFields.title.replace(initial.amount, replacement.toFormat()),
    movements: step.movements.map(movement => ({
      ...movement,
      amount: new BigNumber(movement.amount.replaceAll(',', ''))
        .multipliedBy(ratio)
        .decimalPlaces(8)
        .toFormat(),
      fiat: undefined,
    })),
  };
}

function movementValue(movement: JourneyMovement) {
  const value = new BigNumber(movement.amount.replaceAll(',', ''));
  if (!value.isFinite() || movement.direction === 'neutral') return new BigNumber(0);
  return movement.direction === 'out' ? value.negated() : value;
}

export function receiptBalances(
  step: JourneyStep,
  receipt: JourneyTransaction
): ActivityListBalance[] {
  if (receipt.status !== 'confirmed') return [];
  const symbols = [
    ...new Set([
      ...(step.outcomeMovements ?? step.movements).map(item => item.symbol),
      ...(step.fee ? [step.fee.symbol] : []),
    ]),
  ];
  return symbols.flatMap(symbol => {
    const moved = (step.outcomeMovements ?? step.movements)
      .filter(item => item.symbol === symbol)
      .reduce((sum, movement) => sum.plus(movementValue(movement)), new BigNumber(0));
    const fee =
      step.fee?.symbol === symbol && receipt.feePaid
        ? new BigNumber(step.fee.amount)
        : new BigNumber(0);
    const net = moved.minus(fee);
    if (net.isZero()) return [];
    const price = demoPrices[symbol];
    return [
      {
        symbol,
        amount: net.abs().toFormat(),
        direction: net.isPositive() ? 'in' : 'out',
        fiat: price === undefined ? '' : `$${net.abs().multipliedBy(price).toFormat(2)}`,
      },
    ];
  });
}

export function journeyBalances(definition: JourneyDefinition, run: JourneyRun) {
  const positionSymbols = [
    ...new Set(
      definition.steps.flatMap(step =>
        step.movements
          .filter(movement => movement.direction !== 'neutral')
          .map(movement => movement.symbol)
      )
    ),
  ];
  const balances = [
    ...openingBalances,
    ...positionSymbols
      .filter(symbol => !openingBalances.some(item => item.symbol === symbol))
      .map(symbol => ({ symbol, amount: '0' })),
  ];
  return balances.map(opening => {
    const amount = run.transactions.reduce((balance, receipt) => {
      const original = definition.steps[receipt.stepIndex];
      if (!original) return balance;
      const step = effectiveStep(original, receipt.amounts);
      const moved =
        receipt.status === 'confirmed'
          ? (step.outcomeMovements ?? step.movements)
              .filter(item => item.symbol === opening.symbol)
              .reduce((sum, movement) => sum.plus(movementValue(movement)), new BigNumber(0))
          : new BigNumber(0);
      const fee =
        receipt.feePaid && step.fee?.symbol === opening.symbol
          ? new BigNumber(step.fee.amount)
          : new BigNumber(0);
      return balance.plus(moved).minus(fee);
    }, new BigNumber(opening.amount));
    return { symbol: opening.symbol, amount: amount.toFormat() };
  });
}
