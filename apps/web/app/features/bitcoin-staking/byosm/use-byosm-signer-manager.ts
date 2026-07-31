import { useSearchParams } from 'react-router';

import { pox5NetworkConfig } from '~/data/pox5-network-config';
import { byosmContractParam } from '~/pages/bitcoin-staking/bitcoin-staking.constants';

import { SignerManagerValidation } from '../queries/create-get-pox5-signer-manager-validation-query-options';
import { usePox5SignerManagerValidationQuery } from '../queries/pox5-stacking.query';
import { parseByosmContractInput } from './byosm-contract-schema';

export type ByosmSignerManagerState =
  | { status: 'missing' }
  | { status: 'invalid-format'; reason: 'invalid-format' | 'wrong-network' }
  | { status: 'checking'; contractId: string }
  | {
      status: 'invalid';
      contractId: string;
      validation: Extract<SignerManagerValidation, { status: 'invalid' }>;
    }
  | { status: 'valid'; contractId: string };

export function useByosmSignerManager(): ByosmSignerManagerState {
  const [searchParams] = useSearchParams();
  const parsed = parseByosmContractInput(
    searchParams.get(byosmContractParam),
    pox5NetworkConfig.contractNetworkMode
  );

  const validationQuery = usePox5SignerManagerValidationQuery(
    parsed.ok ? parsed.contractId : undefined
  );

  if (!parsed.ok) {
    if (parsed.reason === 'missing') return { status: 'missing' };
    return { status: 'invalid-format', reason: parsed.reason };
  }

  const validation = validationQuery.data;
  if (!validation) return { status: 'checking', contractId: parsed.contractId };
  if (validation.status === 'invalid') {
    return { status: 'invalid', contractId: parsed.contractId, validation };
  }
  return { status: 'valid', contractId: parsed.contractId };
}
