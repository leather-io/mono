import { contractPrincipalCV, serializeCV, someCV, tupleCV, uintCV } from '@stacks/transactions';
import { pox5NetworkConfig } from '~/data/pox5-network-config';
import { parseContractId } from '~/features/bitcoin-staking/utils/contract-id';
import { getPox5ContractId } from '~/features/bitcoin-staking/utils/pox5-contracts';

// The pox-5 read layer is pinned to the chain selected in
// data/pox5-network-config.ts, so the mocked host and boot contract follow it.
const pox5Contract = parseContractId(getPox5ContractId(pox5NetworkConfig.contractNetworkMode));
const path = `${pox5NetworkConfig.apiUrl}/v2/contracts/call-read/${pox5Contract.contractAddress}/${pox5Contract.contractName}/get-staker-info`;

// Default variant: no pox-5 position, so the start-staking flow renders.
export const pox5GetStakerInfoNoneHandler = {
  path,
  resp: { okay: true, result: '0x09' },
  method: 'post',
} as const;

const specialSignerManager = parseContractId(pox5NetworkConfig.specialSignerManagerContract);

// Cycle numbers align with the /v2/pox mock (current cycle 113); the signer
// matches the "special" pool's signer-manager so the position resolves to a
// known pool.
const stakedResult = someCV(
  tupleCV({
    'amount-ustx': uintCV(40_000_000n),
    'first-reward-cycle': uintCV(110n),
    'num-cycles': uintCV(12n),
    signer: contractPrincipalCV(
      specialSignerManager.contractAddress,
      specialSignerManager.contractName
    ),
  })
);

export const pox5GetStakerInfoStakedHandler = {
  path,
  resp: { okay: true, result: `0x${serializeCV(stakedResult)}` },
  method: 'post',
} as const;
