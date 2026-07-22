import { stackingContractMap } from '~/data/data';
import { NetworkMode } from '~/features/stacking/utils/stacking-network-types';

export function getPox5ContractId(networkMode: NetworkMode): string {
  return stackingContractMap[networkMode].Pox5;
}
