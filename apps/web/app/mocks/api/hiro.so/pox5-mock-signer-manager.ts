import { getSignerManagerContract } from '~/data/bitcoin-staking-data';
import { pox5NetworkConfig } from '~/data/pox5-network-config';
import { parseContractId } from '~/features/bitcoin-staking/utils/contract-id';

// The signer-manager the mock layer answers read-only calls for. Test chains
// expose the "Special" reference deployment; mainnet has none, so mocked
// positions resolve against a listed pool instead. Only reached in mock mode —
// entry.client.tsx imports the mock tree dynamically.
const mockSignerManagerContractId =
  pox5NetworkConfig.specialSignerManagerContract ??
  getSignerManagerContract('stackingDao', pox5NetworkConfig.contractNetworkMode);

if (!mockSignerManagerContractId) {
  throw new Error(
    `No signer-manager contract available to mock on the ${pox5NetworkConfig.contractNetworkMode} chain.`
  );
}

export const mockSignerManager = parseContractId(mockSignerManagerContractId);
