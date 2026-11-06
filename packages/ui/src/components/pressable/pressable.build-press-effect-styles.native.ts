import { type ViewStyle } from 'react-native';
import {
  type CSSTransitionDelay,
  type CSSTransitionDuration,
  type CSSTransitionTimingFunction,
} from 'react-native-reanimated';

import { isEmpty } from 'remeda';

import { type ResolvedPressEffect, pressEffectProperties } from './pressable.types.native';

const defaultDuration = 150;
const defaultDelay = 0;

interface PressEffectStyle extends ViewStyle {
  transitionProperty?: string[];
  transitionDuration?: CSSTransitionDuration[];
  transitionTimingFunction?: CSSTransitionTimingFunction[];
  transitionDelay?: CSSTransitionDelay[];
}

function setStyleValue<K extends keyof PressEffectStyle>(
  style: PressEffectStyle,
  property: K,
  value: PressEffectStyle[K]
) {
  style[property] = value;
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

    setStyleValue(style, property, isPressed ? config.to : config.from);
    transitionProperty.push(property);
    transitionDuration.push(config.duration ?? defaultDuration);
    transitionTimingFunction.push(config.timing ?? 'ease');
    transitionDelay.push(config.delay ?? defaultDelay);
  }

  style.transitionProperty = transitionProperty;
  style.transitionDuration = transitionDuration;
  style.transitionTimingFunction = transitionTimingFunction;
  style.transitionDelay = transitionDelay;

  return style;
}
