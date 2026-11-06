import type { StacksNetworkName } from '@stacks/network';

// Path prefixes that work on non-mainnet networks. Everything else is treated as
// mainnet-only and gets gated when the app is switched to testnet. Add a prefix
// here as each area gains testnet support.
const nonMainnetRoutePrefixes = ['/multisig'];

// Marketing and content pages (formerly the Framer site) don't depend on the network.
const networkAgnosticPaths = ['/'];
const networkAgnosticRoutePrefixes = [
  '/apps',
  '/developers',
  '/news',
  '/explorer',
  '/posts',
  '/support',
  '/changelog',
];

function matchesPrefix(pathname: string, prefix: string) {
  return pathname === prefix || pathname.startsWith(`${prefix}/`);
}

export function routeSupportsNetwork(pathname: string, networkName: StacksNetworkName): boolean {
  if (networkName === 'mainnet') return true;
  if (networkAgnosticPaths.includes(pathname)) return true;
  return [...networkAgnosticRoutePrefixes, ...nonMainnetRoutePrefixes].some(prefix =>
    matchesPrefix(pathname, prefix)
  );
}
