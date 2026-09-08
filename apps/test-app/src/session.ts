// The state a run shares: which network every request is pinned to, and what
// the wallet says is bound to this origin.
//
// `getAddresses` is cached per (network, allowPolicyAccounts) so a page full
// of builder-backed buttons does not prompt for the same thing repeatedly; the
// header's refresh clears it after the developer switches account.
import { callRpc } from './leather';
import { defaultNetworkId } from './networks';
import type { RequestContext } from './types';
import { type AccountSummary, type WalletAddress, fetchAccountSummary } from './wallet';

let currentNetwork = defaultNetworkId;

export function getNetwork(): string {
  return currentNetwork;
}

export function setNetwork(network: string): void {
  if (network === currentNetwork) return;
  currentNetwork = network;
  // Addresses are per network; nothing cached survives a switch.
  addressCache.clear();
  summaryCache = undefined;
}

const addressCache = new Map<string, Promise<WalletAddress[]>>();
let summaryCache: Promise<AccountSummary> | undefined;

/** Wallet access for `params` builders: same provider, unwrapped `result`. */
function createRequestContext(network = currentNetwork): RequestContext {
  return {
    network,
    request(method, params) {
      return callRpc(method, params).then(response => response.result);
    },
  };
}

/**
 * A context whose `getAddresses` calls are served from a per-run cache, so one
 * click that needs several keys still costs one approval prompt.
 */
export function createCachedRequestContext(network = currentNetwork): RequestContext {
  const base = createRequestContext(network);
  return {
    network,
    request(method, params) {
      if (method !== 'getAddresses') return base.request(method, params);
      const key = JSON.stringify({ network, params });
      const cached = addressCache.get(key);
      if (cached) return cached.then(addresses => ({ addresses }));
      const pending = base
        .request(method, params)
        .then(result => {
          const addresses =
            result && typeof result === 'object'
              ? ((result as { addresses?: WalletAddress[] }).addresses ?? [])
              : [];
          return addresses;
        })
        .catch(error => {
          // A rejected prompt must not poison the cache for the next click.
          addressCache.delete(key);
          throw error;
        });
      addressCache.set(key, pending);
      return pending.then(addresses => ({ addresses }));
    },
  };
}

export function clearAddressCache(): void {
  addressCache.clear();
  summaryCache = undefined;
}

/** What the origin is bound to right now; cached until the next refresh. */
export function loadAccountSummary(force = false): Promise<AccountSummary> {
  if (force) summaryCache = undefined;
  if (!summaryCache) summaryCache = fetchAccountSummary(createRequestContext());
  return summaryCache;
}
