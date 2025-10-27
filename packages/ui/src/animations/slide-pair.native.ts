import { withTiming } from 'react-native-reanimated';

type Side = 'left' | 'right' | 'up' | 'down';

interface SlidePairOptions {
  distance?: number;
  duration?: number;
}

/**
 * slidePair('right') returns two complementary animations:
 * - first: enters/exits toward the given side
 * - second: enters/exits toward the opposite side
 *
 * @example:
 * const { first, second } = slidePairFrom('right', {...options});
 */
export function slidePair(side: Side, { distance = 5, duration = 150 }: SlidePairOptions = {}) {
  const isHorizontal = side === 'left' || side === 'right';
  const base = side === 'left' || side === 'up' ? -distance : distance;

  function make(delta: number) {
    function entering() {
      'worklet';
      return {
        initialValues: {
          opacity: 0,
          transform: isHorizontal ? [{ translateX: delta }] : [{ translateY: delta }],
        },
        animations: {
          opacity: withTiming(1, { duration }),
          transform: isHorizontal
            ? [{ translateX: withTiming(0, { duration }) }]
            : [{ translateY: withTiming(0, { duration }) }],
        },
      };
    }

    function exiting() {
      'worklet';
      return {
        initialValues: {
          opacity: 1,
          transform: isHorizontal ? [{ translateX: 0 }] : [{ translateY: 0 }],
        },
        animations: {
          opacity: withTiming(0, { duration }),
          transform: isHorizontal
            ? [{ translateX: withTiming(delta, { duration }) }]
            : [{ translateY: withTiming(delta, { duration }) }],
        },
      };
    }

    return { entering, exiting };
  }

  return {
    first: make(base),
    second: make(-base),
  };
}
