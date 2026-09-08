import { useSyncExternalStore } from 'react';

import { WALLET_ENVIRONMENT } from '@shared/environment';

export const bondScenarios = [
  'none',
  'active',
  'ending-soon',
  'renewal-set',
  'matured',
  'exiting',
  'with-history',
] as const;

export type BondScenario = (typeof bondScenarios)[number];

export const bondScenarioLabels: Record<BondScenario, string> = {
  none: 'No bond',
  active: 'Active, mid-term',
  'ending-soon': 'Active, unlocks in 6 days',
  'renewal-set': 'Unlocks in 6 days, next period registered',
  matured: 'Ended, waiting for withdrawal',
  exiting: 'Early exit announced',
  'with-history': 'Active, with two past periods',
};

export function isBondScenario(value: unknown): value is BondScenario {
  return bondScenarios.some(scenario => scenario === value);
}

const storageKey = 'leather-mock-bond';
const changeEvent = 'leather-mock-bond-change';

// Scenarios are dead code in store builds; only dev, feature (PR) and test
// builds honour the localStorage key.
export const isBondMockAllowed = WALLET_ENVIRONMENT !== 'production';

export function readBondScenario(): BondScenario {
  if (!isBondMockAllowed) return 'none';
  try {
    const value = localStorage.getItem(storageKey);
    return isBondScenario(value) ? value : 'none';
  } catch {
    return 'none';
  }
}

export function setBondScenario(scenario: BondScenario) {
  if (!isBondMockAllowed) return;
  try {
    if (scenario === 'none') localStorage.removeItem(storageKey);
    else localStorage.setItem(storageKey, scenario);
  } catch {
    // storage unavailable, nothing to persist
  }
  window.dispatchEvent(new Event(changeEvent));
}

function subscribe(onChange: () => void) {
  window.addEventListener(changeEvent, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(changeEvent, onChange);
    window.removeEventListener('storage', onChange);
  };
}

export function useBondScenario(): BondScenario {
  return useSyncExternalStore(subscribe, readBondScenario, () => 'none' as const);
}
