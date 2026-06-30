import { useStacksNetwork } from '~/store/stacks-network';

import type { AuthNetworkId } from '@leather.io/models';

type MultisigNetworkMode = 'mainnet' | 'testnet';

interface MultisigNetworks {
  btc: AuthNetworkId;
  stx: AuthNetworkId;
}

// Multisig follows the web app's active network (the shared `networkName` atom),
// mapping anything that isn't mainnet to testnet (the only two modes the multisig
// auth model, AuthNetworkId, supports).
export function useMultisigNetworks(): MultisigNetworks {
  const { networkName } = useStacksNetwork();
  const mode: MultisigNetworkMode = networkName === 'mainnet' ? 'mainnet' : 'testnet';
  return { btc: `btc:${mode}`, stx: `stx:${mode}` };
}
