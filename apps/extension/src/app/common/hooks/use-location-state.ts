import { useEffect, useState } from 'react';
import { useLocation } from 'react-router';

import get from 'lodash.get';

import { isUndefined } from '@leather.io/utils';

type LocationState = string | boolean | undefined | number | Location;

export function useLocationState<T extends LocationState>(propName: string): T;
export function useLocationState<T extends LocationState>(
  propName: string,
  defaultValue: string
): T;
export function useLocationState(propName: string): string | undefined;
export function useLocationState(propName: string, defaultValue: string): string;
export function useLocationState(propName: string, defaultValue?: string): unknown {
  const location = useLocation();
  const value: unknown = get(location, `state.${propName}`, defaultValue);
  return value;
}

export function useLocationStateWithCache<T = string>(propName: string): T | undefined;
export function useLocationStateWithCache<T = string>(propName: string, defaultValue: T): T;
export function useLocationStateWithCache<T = string>(propName: string, defaultValue?: T): unknown {
  const location = useLocation();
  const [value, setValue] = useState<unknown>(defaultValue);
  const stateVal: unknown = get(location, `state.${propName}`);

  useEffect(() => {
    if (!isUndefined(stateVal)) setValue(stateVal);
  }, [location, propName, stateVal]);

  return stateVal ?? value ?? defaultValue;
}
