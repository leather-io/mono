import BigNumber from 'bignumber.js';
import { describe, expect, test } from 'vitest';

import { journeyDefinitions } from './journey-definitions';

describe('Journey request fixtures', () => {
  test('every amount can be used by the shared balance model, including every variant', () => {
    for (const definition of journeyDefinitions) {
      const steps = [
        ...definition.steps,
        ...(definition.variants?.flatMap(variant => variant.steps) ?? []),
      ];
      for (const step of steps) {
        for (const movement of [...step.movements, ...(step.outcomeMovements ?? [])]) {
          const amount = new BigNumber(movement.amount.replaceAll(',', ''));
          expect(amount.isFinite(), `${definition.id}/${step.id}/${movement.symbol}`).toBe(true);
          expect(amount.isPositive()).toBe(true);
        }
      }
    }
  });
});
