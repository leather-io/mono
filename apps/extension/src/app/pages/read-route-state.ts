import get from 'lodash.get';

import { isNumber, isString } from '@leather.io/utils';

export function readRouteStateString(state: unknown, path: string): string | undefined;
export function readRouteStateString(state: unknown, path: string, fallback: string): string;
export function readRouteStateString(state: unknown, path: string, fallback?: string) {
  const value: unknown = get(state, path);
  return isString(value) ? value : fallback;
}

export function readRouteStateNumber(state: unknown, path: string): number | undefined;
export function readRouteStateNumber(state: unknown, path: string, fallback: number): number;
export function readRouteStateNumber(state: unknown, path: string, fallback?: number) {
  const value: unknown = get(state, path);
  return isNumber(value) ? value : fallback;
}
