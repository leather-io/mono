import { Dimensions } from 'react-native';
import {
  Easing,
  SharedValue,
  withDelay,
  withRepeat,
  withSpring,
  withTiming,
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export const BTC = {
  startPosition: {
    left: -90,
    top: 320,
    rotationDeg: -5,
  },
  mainPosition: {
    left: width / 3.5,
    top: 280,
    rotationDeg: 10,
  },
  keyboardPosition: {
    left: width / 3.5,
    top: 250,
    rotationDeg: 10,
  },
} as const;

export const DIAMOND = {
  startPosition: {
    left: width + 5,
    top: 0,
    rotationDeg: 5,
  },
  mainPosition: {
    left: width - 100,
    top: 50,
    rotationDeg: -15,
  },
  keyboardPosition: {
    left: width - 100,
    top: 20,
    rotationDeg: -15,
  },
} as const;

export const TITLE_1 = {
  startPosition: {
    opacity: 0,
    left: -30,
  },
  mainPosition: {
    opacity: 1,
    left: 0,
  },
} as const;

export const TITLE_2 = {
  startPosition: {
    opacity: 0,
    left: -15,
  },
  mainPosition: {
    opacity: 1,
    left: 0,
  },
} as const;

export const SUBTITLE_1 = {
  startPosition: {
    opacity: 0,
    left: -15,
  },
  mainPosition: {
    opacity: 1,
    left: 0,
  },
} as const;

export const CONTAINER = {
  mainPosition: {
    top: 0,
  },
  keyboardPosition: {
    top: -20,
  },
} as const;

export const BOTTOM_SHEET = {
  startPosition: {
    bottom: -900,
  },
  mainPosition: {
    bottom: 0,
  },
} as const;

export const SPINNER = {
  startPosition: {
    rotationDeg: 0,
  },
  endPosition: {
    rotationDeg: 360,
  },
};

const springConfig = {
  mass: 1,
  damping: 20,
  stiffness: 75,
};

const bottomSheetConfig = {
  duration: 1200,
  easing: Easing.bezier(0.5, 0.01, 0, 1),
};

const stringAnimationConfig = {
  duration: 500,
  easing: Easing.out(Easing.quad),
};

const keyboardConfig = {
  duration: 400,
  easing: Easing.out(Easing.poly(2)),
};

export function infiniteLoop(x: number) {
  return withRepeat(
    withTiming(x, {
      duration: 1000,
      easing: Easing.linear,
    }),
    -1
  );
}

export function stringAnimationFn(x: number) {
  return withDelay(400, withTiming(x, stringAnimationConfig));
}

export function iconIntroAnimationFn(x: number) {
  return withDelay(800, withSpring(x, springConfig));
}

export function keyboardAnimationFn(x: number) {
  return withTiming(x, keyboardConfig);
}

export function bottomSheetAnimationFn(x: number) {
  return withDelay(1200, withTiming(x, bottomSheetConfig));
}

export function animate<
  T extends Record<keyof K, SharedValue<number>>,
  K extends Record<string, number>,
>(component: T, animFn: (x: number) => number, position: K) {
  Object.entries(component).forEach(([key, sharedValue]) => {
    sharedValue.value = animFn(position[key]);
  });
}
