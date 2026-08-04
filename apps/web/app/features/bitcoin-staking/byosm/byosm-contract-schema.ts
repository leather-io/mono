import { z } from 'zod';
import { bitcoinStakingContent } from '~/content/bitcoin-staking-content';
import { NetworkMode } from '~/features/stacking/utils/stacking-network-types';

import { contractPrincipalSchema, stacksAddressNetwork } from '@leather.io/stacks';

type ByosmContractParseResult =
  | { ok: true; contractId: string }
  | { ok: false; reason: 'missing' | 'invalid-format' | 'wrong-network' };

function expectedAddressNetwork(networkMode: NetworkMode) {
  return networkMode === 'mainnet' ? 'mainnet' : 'testnet';
}

function matchesNetwork(contractId: string, networkMode: NetworkMode) {
  return stacksAddressNetwork(contractId.split('.')[0]) === expectedAddressNetwork(networkMode);
}

export function parseByosmContractInput(
  raw: string | null,
  networkMode: NetworkMode
): ByosmContractParseResult {
  const input = raw?.trim();
  if (!input) return { ok: false, reason: 'missing' };
  if (!contractPrincipalSchema.safeParse(input).success)
    return { ok: false, reason: 'invalid-format' };
  if (!matchesNetwork(input, networkMode)) return { ok: false, reason: 'wrong-network' };
  return { ok: true, contractId: input };
}

export interface ByosmContractFormSchema {
  contract: string;
}

export function createByosmContractFormSchema(networkMode: NetworkMode) {
  return z.object({
    contract: z
      .string()
      .trim()
      .refine(value => contractPrincipalSchema.safeParse(value).success, {
        message: bitcoinStakingContent.byosm.errors.invalidFormat,
      })
      .refine(
        value =>
          !contractPrincipalSchema.safeParse(value).success || matchesNetwork(value, networkMode),
        { message: bitcoinStakingContent.byosm.errors.wrongNetwork }
      ),
  });
}
