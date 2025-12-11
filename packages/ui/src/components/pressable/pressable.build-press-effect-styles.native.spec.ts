import { describe, expect, it } from 'vitest';

import { buildPressEffectStyles } from './pressable.build-press-effect-styles.native';

describe('buildPressEffectStyles', () => {
  describe('null and empty inputs', () => {
    it('returns empty style when pressEffect is null', () => {
      const result = buildPressEffectStyles(null, true);
      expect(result).toEqual({});
    });

    it('returns empty style when pressEffect is empty object', () => {
      const result = buildPressEffectStyles({}, true);
      expect(result).toEqual({});
    });
  });

  describe('pressed state', () => {
    it.each([true, false])('returns correct opacity value when isPressed=%s', isPressed => {
      const result = buildPressEffectStyles({ opacity: { from: 1, to: 0.7 } }, isPressed);
      expect(result.opacity).toBe(isPressed ? 0.7 : 1);
    });
  });

  describe('transition settings', () => {
    it.each([true, false])(
      'uses default duration (150) when not specified, isPressed=%s',
      isPressed => {
        const result = buildPressEffectStyles({ opacity: { from: 1, to: 0.7 } }, isPressed);
        expect(result.transitionProperty).toEqual(['opacity']);
        expect(result.transitionDuration).toEqual([150]);
      }
    );

    it.each([true, false])('uses custom duration when specified, isPressed=%s', isPressed => {
      const result = buildPressEffectStyles(
        { opacity: { from: 1, to: 0.7, duration: 300 } },
        isPressed
      );
      expect(result.transitionDuration).toEqual([300]);
    });

    it.each([true, false])('includes timing when specified, isPressed=%s', isPressed => {
      const result = buildPressEffectStyles(
        { opacity: { from: 1, to: 0.7, timing: 'ease-out' } },
        isPressed
      );
      expect(result.transitionTimingFunction).toEqual(['ease-out']);
    });

    it.each([true, false])('includes delay when specified, isPressed=%s', isPressed => {
      const result = buildPressEffectStyles(
        { opacity: { from: 1, to: 0.7, delay: 100 } },
        isPressed
      );
      expect(result.transitionDelay).toEqual([100]);
    });

    it.each([true, false])(
      'uses default timing (ease) when none specified, isPressed=%s',
      isPressed => {
        const result = buildPressEffectStyles({ opacity: { from: 1, to: 0.7 } }, isPressed);
        expect(result.transitionTimingFunction).toEqual(['ease']);
      }
    );

    it.each([true, false])(
      'uses default delay (0) when none specified, isPressed=%s',
      isPressed => {
        const result = buildPressEffectStyles({ opacity: { from: 1, to: 0.7 } }, isPressed);
        expect(result.transitionDelay).toEqual([0]);
      }
    );
  });

  describe('multiple properties', () => {
    const multiPropertyEffect = {
      opacity: { from: 1, to: 0.7, duration: 100 },
      transform: { from: [{ scale: 1 }], to: [{ scale: 0.95 }], duration: 200 },
      backgroundColor: { from: '#ffffff', to: '#000000', duration: 300 },
    } as const;

    it.each([true, false])('processes all properties together, isPressed=%s', isPressed => {
      const result = buildPressEffectStyles(multiPropertyEffect, isPressed);
      expect(result.opacity).toBe(isPressed ? 0.7 : 1);
      expect(result.transform).toEqual(isPressed ? [{ scale: 0.95 }] : [{ scale: 1 }]);
      expect(result.backgroundColor).toBe(isPressed ? '#000000' : '#ffffff');
    });

    it('aligns transitionProperty array with style values', () => {
      const result = buildPressEffectStyles(multiPropertyEffect, true);
      expect(result.transitionProperty).toEqual(['opacity', 'transform', 'backgroundColor']);
    });

    it('aligns transitionDuration array with properties', () => {
      const result = buildPressEffectStyles(multiPropertyEffect, true);
      expect(result.transitionDuration).toEqual([100, 200, 300]);
    });

    it('uses default timing for unspecified properties', () => {
      const effect = {
        opacity: { from: 1, to: 0.7, timing: 'ease-in' as const },
        transform: { from: [{ scale: 1 }], to: [{ scale: 0.95 }] },
        backgroundColor: { from: '#fff', to: '#000', timing: 'ease-out' as const },
      };
      const result = buildPressEffectStyles(effect, true);
      expect(result.transitionTimingFunction).toEqual(['ease-in', 'ease', 'ease-out']);
    });

    it('uses default delay for unspecified properties', () => {
      const effect = {
        opacity: { from: 1, to: 0.7, delay: 50 },
        transform: { from: [{ scale: 1 }], to: [{ scale: 0.95 }] },
        backgroundColor: { from: '#fff', to: '#000', delay: 100 },
      };
      const result = buildPressEffectStyles(effect, true);
      expect(result.transitionDelay).toEqual([50, 0, 100]);
    });

    it('never contains undefined values in transition arrays', () => {
      const effect = {
        opacity: { from: 1, to: 0.7 },
        transform: { from: [{ scale: 1 }], to: [{ scale: 0.95 }], timing: 'linear' as const },
        backgroundColor: { from: '#fff', to: '#000', delay: 50 },
      };
      const result = buildPressEffectStyles(effect, true);
      expect(result.transitionTimingFunction).not.toContain(undefined);
      expect(result.transitionDelay).not.toContain(undefined);
    });
  });

  describe('specific property types', () => {
    it.each([true, false])('handles transform array values correctly, isPressed=%s', isPressed => {
      const result = buildPressEffectStyles(
        {
          transform: {
            from: [{ scale: 1 }, { rotate: '0deg' }],
            to: [{ scale: 0.95 }, { rotate: '5deg' }],
          },
        },
        isPressed
      );
      expect(result.transform).toEqual(
        isPressed ? [{ scale: 0.95 }, { rotate: '5deg' }] : [{ scale: 1 }, { rotate: '0deg' }]
      );
      expect(result.transitionProperty).toEqual(['transform']);
    });

    it.each([true, false])(
      'handles backgroundColor string values correctly, isPressed=%s',
      isPressed => {
        const result = buildPressEffectStyles(
          { backgroundColor: { from: 'rgba(255,255,255,1)', to: 'rgba(0,0,0,0.5)' } },
          isPressed
        );
        expect(result.backgroundColor).toBe(isPressed ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,1)');
        expect(result.transitionProperty).toEqual(['backgroundColor']);
      }
    );
  });
});
