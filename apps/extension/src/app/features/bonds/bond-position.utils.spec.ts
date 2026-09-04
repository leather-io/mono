import { createMoney } from '@leather.io/utils';

import { bondFixtures } from './bond-fixtures';
import {
  daysUntil,
  endingSoonThresholdBlocks,
  estimateDateAtBurnHeight,
  hasActiveBond,
  isEndingSoon,
  subtractMoneyFloor,
} from './bond-position.utils';

describe('bond position utils', () => {
  describe(subtractMoneyFloor.name, () => {
    it('subtracts in the base currency', () => {
      const result = subtractMoneyFloor(
        createMoney(24_300_000_000, 'STX'),
        createMoney(10_000_000_000, 'STX')
      );
      expect(result.amount.toNumber()).toBe(14_300_000_000);
      expect(result.symbol).toBe('STX');
    });

    it('never goes below zero', () => {
      const result = subtractMoneyFloor(createMoney(5, 'STX'), createMoney(10, 'STX'));
      expect(result.amount.toNumber()).toBe(0);
    });
  });

  describe(isEndingSoon.name, () => {
    const position = bondFixtures.active.position!;

    it('is false mid-term', () => {
      expect(isEndingSoon(position, { burnBlockHeight: position.unlockBurnHeight - 5_000 })).toBe(
        false
      );
    });

    it('is true inside the threshold', () => {
      expect(
        isEndingSoon(position, {
          burnBlockHeight: position.unlockBurnHeight - endingSoonThresholdBlocks + 1,
        })
      ).toBe(true);
    });

    it('is false once unlocked', () => {
      expect(isEndingSoon(position, { burnBlockHeight: position.unlockBurnHeight })).toBe(false);
      expect(
        isEndingSoon(
          { ...position, status: 'unlocked' },
          { burnBlockHeight: position.unlockBurnHeight - 10 }
        )
      ).toBe(false);
    });
  });

  describe(daysUntil.name, () => {
    it('rounds up to whole days at 144 blocks a day', () => {
      expect(daysUntil(1_000, { burnBlockHeight: 1_000 - 864 })).toBe(6);
      expect(daysUntil(1_000, { burnBlockHeight: 1_000 - 865 })).toBe(7);
      expect(daysUntil(1_000, { burnBlockHeight: 1_000 })).toBe(0);
    });
  });

  describe(estimateDateAtBurnHeight.name, () => {
    it('projects ten minutes per block from now', () => {
      const now = Date.UTC(2026, 10, 6);
      const date = estimateDateAtBurnHeight(1_144, { burnBlockHeight: 1_000 }, now);
      expect(date.getTime()).toBe(now + 24 * 60 * 60 * 1000);
    });
  });

  describe(hasActiveBond.name, () => {
    it('is true only for an active position', () => {
      expect(hasActiveBond(bondFixtures.active)).toBe(true);
      expect(hasActiveBond(bondFixtures['ending-soon'])).toBe(true);
      expect(hasActiveBond(bondFixtures.unlocked)).toBe(false);
      expect(hasActiveBond(bondFixtures.none)).toBe(false);
      expect(hasActiveBond(undefined)).toBe(false);
    });
  });

  describe('fixtures', () => {
    it('ending-soon scenarios sit inside the threshold', () => {
      const endingSoon = bondFixtures['ending-soon'];
      const renewal = bondFixtures['renewal-set'];
      expect(isEndingSoon(endingSoon.position!, endingSoon)).toBe(true);
      expect(isEndingSoon(renewal.position!, renewal)).toBe(true);
      expect(renewal.position!.renewal).toBeDefined();
    });

    it('the renewal starts where the current period ends its window', () => {
      const { position } = bondFixtures['renewal-set'];
      expect(position!.renewal!.startBurnHeight).toBe(
        position!.nextPeriod!.registrationClosesBurnHeight
      );
    });
  });
});
