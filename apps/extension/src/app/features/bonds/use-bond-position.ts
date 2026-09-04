import { useSyncExternalStore } from 'react';

import { useQuery } from '@tanstack/react-query';

import { btcAsset } from '@leather.io/constants';
import type { AccountAddresses, Money } from '@leather.io/models';
import { baseCurrencyAmountInQuote } from '@leather.io/utils';

import { WALLET_ENVIRONMENT } from '@shared/environment';

import { useMarketData } from '@app/query/common/market-data/market-data.query';
import { useCurrentAccountAddresses } from '@app/services/accounts/use-account-addresses';
import { toFetchState } from '@app/services/fetch-state';

import { type BondScenario, bondFixtures, isBondScenario } from './bond-fixtures';
import type { BondContext, BondPosition } from './bond-position.model';
import { bondLockedBtc } from './bond-position.utils';

const bondMockStorageKey = 'leather-mock-bond';
const bondMockChangeEvent = 'leather-mock-bond-change';

// Mock scenarios are dead code in store builds; only dev, feature (PR) and
// test builds honour the localStorage key.
export const isBondMockAllowed = WALLET_ENVIRONMENT !== 'production';

function readBondScenario(): BondScenario {
  if (!isBondMockAllowed) return 'none';
  try {
    const value = localStorage.getItem(bondMockStorageKey);
    return isBondScenario(value) ? value : 'none';
  } catch {
    return 'none';
  }
}

export function setBondScenario(scenario: BondScenario) {
  if (!isBondMockAllowed) return;
  try {
    if (scenario === 'none') localStorage.removeItem(bondMockStorageKey);
    else localStorage.setItem(bondMockStorageKey, scenario);
  } catch {
    // storage unavailable, nothing to persist
  }
  window.dispatchEvent(new Event(bondMockChangeEvent));
}

function subscribeToBondScenario(onChange: () => void) {
  window.addEventListener(bondMockChangeEvent, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(bondMockChangeEvent, onChange);
    window.removeEventListener('storage', onChange);
  };
}

export function useBondScenario() {
  return useSyncExternalStore(subscribeToBondScenario, readBondScenario, () => 'none' as const);
}

const noPosition: BondContext = { position: null, burnBlockHeight: 0 };

// TODO(bonds): real reads. The staking app already does each of these:
//   - pox-5 `get-bond-membership(principal)` → bondIndex, amount-sats, amount-ustx
//   - GET /extended/v3/staking/bonds/{bond_index} → schedule + status
//   - GET /extended/v3/staking/bonds/{next}/registrations/{principal} → renewal
//   - pox-5 `construct-lockup-output-script` → policy address
// See bitcoin-staking-app `src/lib/pox5/{positions,bonds,registrations,reads}.ts`.
function fetchBondContext(
  _account: AccountAddresses,
  scenario: BondScenario
): Promise<BondContext> {
  if (isBondMockAllowed && scenario !== 'none') return Promise.resolve(bondFixtures[scenario]);
  return Promise.resolve(noPosition);
}

export function useBondPosition() {
  const account = useCurrentAccountAddresses();
  const scenario = useBondScenario();
  return toFetchState(
    useQuery({
      queryKey: ['bond-position', account, scenario],
      queryFn: () => fetchBondContext(account, scenario),
      staleTime: 60_000,
    })
  );
}

/** Fiat value of the BTC locked in a bond, in the user's quote currency */
export function useBondLockedBtcQuote(
  position: BondPosition | null | undefined
): Money | undefined {
  const marketData = useMarketData(btcAsset);
  if (!position || marketData.state !== 'success') return undefined;
  return baseCurrencyAmountInQuote(bondLockedBtc(position), marketData.value);
}
