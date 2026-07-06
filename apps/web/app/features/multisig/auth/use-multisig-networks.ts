import { useStacksNetwork } from '~/store/stacks-network';

import { type MultisigNetworks, resolveMultisigNetworks } from './multisig-networks';

// Multisig follows the web app's active network (the shared `networkName` atom),
// mapping anything that isn't mainnet to testnet (the only two modes the multisig
// auth model, AuthNetworkId, supports).
export function useMultisigNetworks(): MultisigNetworks {
  const { networkName } = useStacksNetwork();
  return resolveMultisigNetworks(networkName);
}
