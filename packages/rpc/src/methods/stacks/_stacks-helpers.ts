import { z } from 'zod';

export const stacksTransactionDetailsSchema = z.object({
  txid: z.string(),
  transaction: z.string(),
});

// Clarity values
export const cvIntSchema = z.object({
  type: z.literal('int'),
  value: z.string(), // `bigint` compatible
});

export const cvUintSchema = z.object({
  type: z.literal('uint'),
  value: z.string(), // `bigint` compatible
});

export const cvBufferSchema = z.object({
  type: z.literal('buffer'),
  value: z.string(), // hex-encoded string
});

export const cvTrueSchema = z.object({
  type: z.literal('true'),
});

export const cvFalseSchema = z.object({
  type: z.literal('false'),
});

export const cvAddressSchema = z.object({
  type: z.literal('address'),
  value: z.string(), // Stacks c32-encoded
});

export const cvContractSchema = z.object({
  type: z.literal('contract'),
  value: z.string(), // Stacks c32-encoded, with contract name suffix
});

export const cvOkSchema = z.object({
  type: z.literal('ok'),
  value: z.unknown(), // Clarity value
});

export const cvErrSchema = z.object({
  type: z.literal('err'),
  value: z.unknown(), // Clarity value
});

export const cvNoneSchema = z.object({
  type: z.literal('none'),
});

export const cvSomeSchema = z.object({
  type: z.literal('some'),
  value: z.unknown(), // Clarity value
});

export const cvListSchema = z.object({
  type: z.literal('list'),
  value: z.array(z.unknown()), // Array of Clarity values
});

export const cvTupleSchema = z.object({
  type: z.literal('tuple'),
  value: z.record(z.unknown()), // Record of Clarity values
});

export const cvAsciiSchema = z.object({
  type: z.literal('ascii'),
  value: z.string(), // ASCII-compatible string
});

export const cvUtf8Schema = z.object({
  type: z.literal('utf8'),
  value: z.string(),
});

export const clarityValueSchema = z.union([
  cvIntSchema,
  cvUintSchema,
  cvBufferSchema,
  cvTrueSchema,
  cvFalseSchema,
  cvAddressSchema,
  cvContractSchema,
  cvOkSchema,
  cvErrSchema,
  cvNoneSchema,
  cvSomeSchema,
  cvListSchema,
  cvTupleSchema,
  cvAsciiSchema,
  cvUtf8Schema,
]);
