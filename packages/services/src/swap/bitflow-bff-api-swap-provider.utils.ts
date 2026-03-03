import { Cl, type ClarityValue, Pc, type PostCondition } from '@stacks/transactions';

import type {
  BitflowBffApiPostCondition,
  BitflowBffApiSwapSimpleParameter,
} from '../infrastructure/api/bitflow/bitflow-bff-api.client';

const MAX_TOTAL_STEPS = 290;
const ADDITIONAL_STEPS = 5;

function resolvePostConditionPrincipal(senderAddress: string, txSenderAddress: string): string {
  return senderAddress === 'tx-sender' ? txSenderAddress : senderAddress;
}

function isStxPostConditionType(postConditionType: string): boolean {
  return postConditionType === 'standard_stx' || postConditionType === 'contract_stx';
}

function extractContractId(tokenContract: string): `${string}.${string}` {
  const separatorIndex = tokenContract.indexOf('::');
  const contractId = separatorIndex === -1 ? tokenContract : tokenContract.slice(0, separatorIndex);
  return contractId as `${string}.${string}`;
}

function buildPostConditionWithConditionCode(
  principal: string,
  amount: string,
  conditionCode: string
) {
  const pc = Pc.principal(principal);
  if (conditionCode === 'less_than_or_equal_to') return pc.willSendLte(amount);
  if (conditionCode === 'greater_than_or_equal_to') return pc.willSendGte(amount);
  throw new Error(`Unknown Bitflow BFF API condition code: ${conditionCode}`);
}

export function convertBffApiPostConditions(
  apiPostConditions: BitflowBffApiPostCondition[],
  senderStxAddress: string
): PostCondition[] {
  return apiPostConditions.map(apiPc => {
    const principal = resolvePostConditionPrincipal(apiPc.sender_address, senderStxAddress);
    const pcWithCondition = buildPostConditionWithConditionCode(
      principal,
      apiPc.amount,
      apiPc.condition_code
    );

    if (isStxPostConditionType(apiPc.post_condition_type)) {
      return pcWithCondition.ustx();
    }

    const contractId = extractContractId(apiPc.token_contract);
    return pcWithCondition.ft(contractId, apiPc.token_asset_name);
  });
}

function applyStepScaling(params: BitflowBffApiSwapSimpleParameter[]): number[] {
  const rawSteps = params.map(p =>
    Math.max(1, Math.min(p.max_steps + ADDITIONAL_STEPS, MAX_TOTAL_STEPS))
  );
  const totalSteps = rawSteps.reduce((sum, s) => sum + s, 0);
  if (totalSteps <= MAX_TOTAL_STEPS) return rawSteps;
  const scaleFactor = MAX_TOTAL_STEPS / totalSteps;
  return rawSteps.map(s => Math.max(1, Math.floor(s * scaleFactor)));
}

export function convertBffApiSimpleSwapToFunctionArgs(
  swapParams: BitflowBffApiSwapSimpleParameter[]
): ClarityValue[] {
  const scaledSteps = applyStepScaling(swapParams);

  const tuples = swapParams.map((param, index) =>
    Cl.tuple({
      'pool-trait': Cl.contractPrincipal(
        param.pool_trait.split('.')[0],
        param.pool_trait.split('.')[1]
      ),
      'x-token-trait': Cl.contractPrincipal(
        param.x_token_trait.split('.')[0],
        param.x_token_trait.split('.')[1]
      ),
      'y-token-trait': Cl.contractPrincipal(
        param.y_token_trait.split('.')[0],
        param.y_token_trait.split('.')[1]
      ),
      amount: Cl.uint(param.amount),
      'min-received': Cl.uint(param.min_received),
      'x-for-y': Cl.bool(param.x_for_y),
      'max-steps': Cl.uint(scaledSteps[index]),
    })
  );

  return [Cl.list(tuples)];
}

export function parseSwapContractAddress(swapContract: string): {
  contractAddress: string;
  contractName: string;
} {
  const dotIndex = swapContract.indexOf('.');
  if (dotIndex === -1) {
    throw new Error(`Invalid swap contract format: ${swapContract}`);
  }
  return {
    contractAddress: swapContract.slice(0, dotIndex),
    contractName: swapContract.slice(dotIndex + 1),
  };
}
