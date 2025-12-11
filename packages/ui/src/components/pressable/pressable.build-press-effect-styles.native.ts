import { ViewStyle } from 'react-native';
import {
  CSSTransitionDelay,
  CSSTransitionDuration,
  CSSTransitionTimingFunction,
} from 'react-native-reanimated';

import { isEmpty } from 'remeda';

import { ResolvedPressEffect, pressEffectProperties } from './pressable.types.native';

const defaultDuration = 150;

interface PressEffectStyle extends ViewStyle {
  transitionProperty?: string[];
  transitionDuration?: CSSTransitionDuration[];
  transitionTimingFunction?: CSSTransitionTimingFunction[];
  transitionDelay?: CSSTransitionDelay[];
}

export function buildPressEffectStyles(
  pressEffect: ResolvedPressEffect | null,
  isPressed: boolean
): PressEffectStyle {
  if (!pressEffect || isEmpty(pressEffect)) return {};

  const style: PressEffectStyle = {};
  const transitionProperty: string[] = [];
  const transitionDuration: CSSTransitionDuration[] = [];
  const transitionTimingFunction: CSSTransitionTimingFunction[] = [];
  const transitionDelay: CSSTransitionDelay[] = [];

  for (const property of pressEffectProperties) {
    const config = pressEffect[property];
    if (!config) continue;

    (style[property] as typeof config.to) = isPressed ? config.to : config.from;
    transitionProperty.push(property);
    transitionDuration.push(config.duration ?? defaultDuration);
    transitionTimingFunction.push(config.timing ?? 'ease');
    transitionDelay.push(config.delay ?? 0);
  }

  style.transitionProperty = transitionProperty;
  style.transitionDuration = transitionDuration;
  style.transitionTimingFunction = transitionTimingFunction;
  style.transitionDelay = transitionDelay;

  return style;
}
