import { z } from 'zod';

import { type BitflowSdkSelectedSwapRoute } from './bitflow-sdk.client';

const bitflowSdkPostConditionSchema = z.looseObject({
  senderAddress: z.string(),
  shareFeeContract: z.string().nullable(),
  dikoStx: z.string().nullable(),
  tokenContract: z.string(),
  tokenName: z.string(),
  tokenDecimals: z.union([z.number(), z.string()]),
});

const bitflowSdkContractCallSchema = z.looseObject({
  contract: z.string(),
  function: z.string(),
  parameters: z.record(z.string(), z.unknown()),
});

export const bitflowSdkSelectedSwapRouteSchema = z.looseObject({
  dex_path: z.array(z.string()),
  postConditions: z.record(z.string(), bitflowSdkPostConditionSchema),
  quoteData: bitflowSdkContractCallSchema,
  swapData: bitflowSdkContractCallSchema,
  token_path: z.array(z.string()),
  tokenXDecimals: z.number(),
  tokenYDecimals: z.number(),
}) satisfies z.ZodType<BitflowSdkSelectedSwapRoute>;
