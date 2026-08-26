import { useSearchParams } from 'react-router';

import { BitcoinStakingPool, getPoolBySignerManager } from '~/data/bitcoin-staking-data';
import { pox5NetworkConfig } from '~/data/pox5-network-config';
import { byosmContractParam } from '~/pages/bitcoin-staking/bitcoin-staking.constants';

import { SignerManagerValidation } from '../queries/create-get-pox5-signer-manager-validation-query-options';
import { usePox5SignerManagerValidationQuery } from '../queries/pox5-stacking.query';
import { parseByosmContractInput } from './byosm-contract-schema';

export type ByosmSignerManagerState =
  | { status: 'missing' }
  | { status: 'invalid-format'; reason: 'invalid-format' | 'wrong-network' }
  | { status: 'listed'; pool: BitcoinStakingPool }
  | { status: 'checking'; contractId: string }
  | { status: 'check-failed'; contractId: string; retry(): void }
  | {
      status: 'invalid';
      contractId: string;
      validation: Extract<SignerManagerValidation, { status: 'invalid' }>;
    }
  | { status: 'valid'; contractId: string };

export function useSignerManagerContractInput(rawInput: string | null): ByosmSignerManagerState {
  const parsed = parseByosmContractInput(rawInput, pox5NetworkConfig.contractNetworkMode);

  const listedPool = parsed.ok ? getPoolBySignerManager(parsed.contractId) : undefined;
  const validationQuery = usePox5SignerManagerValidationQuery(
    parsed.ok && !listedPool ? parsed.contractId : undefined
  );

  if (!parsed.ok) {
    if (parsed.reason === 'missing') return { status: 'missing' };
    return { status: 'invalid-format', reason: parsed.reason };
  }

  if (listedPool) return { status: 'listed', pool: listedPool };

  if (validationQuery.isError && !validationQuery.isFetching) {
    return {
      status: 'check-failed',
      contractId: parsed.contractId,
      retry() {
        void validationQuery.refetch();
      },
    };
  }

  const validation = validationQuery.data;
  if (!validation) return { status: 'checking', contractId: parsed.contractId };
  if (validation.status === 'invalid') {
    return { status: 'invalid', contractId: parsed.contractId, validation };
  }
  return { status: 'valid', contractId: parsed.contractId };
}

export function useByosmSignerManager(): ByosmSignerManagerState {
  const [searchParams] = useSearchParams();
  return useSignerManagerContractInput(searchParams.get(byosmContractParam));
}
