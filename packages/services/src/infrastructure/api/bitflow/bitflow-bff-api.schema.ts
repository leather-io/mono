import { z } from 'zod';

import { type BitflowBffApiQuoteResponse } from './bitflow-bff-api.client';

const bitflowBffApiExecutionStepSchema = z.looseObject({
  pool_trait: z.string(),
  pool_id: z.string().nullish(),
  x_token_trait: z.string(),
  y_token_trait: z.string(),
  expected_bin_id: z.number(),
  function_name: z.string(),
  x_in: z.string().nullish(),
  y_in: z.string().nullish(),
  x_out: z.string().nullish(),
  y_out: z.string().nullish(),
  is_empty_swap: z.boolean().nullish(),
});

export const bitflowBffApiQuoteResponseSchema = z.looseObject({
  success: z.boolean(),
  amount_out: z.string(),
  min_amount_out: z.string(),
  slippage_tolerance: z.number(),
  route_path: z.array(z.string()),
  execution_path: z.array(bitflowBffApiExecutionStepSchema),
  fee: z.string(),
  price_impact_bps: z.number(),
  price_impact_tokens: z.string(),
  error: z.string().nullish(),
  input_token_decimals: z.number().nullish(),
  output_token_decimals: z.number().nullish(),
  execution_details: z.record(z.string(), z.unknown()).nullish(),
}) satisfies z.ZodType<BitflowBffApiQuoteResponse>;
