import {
  BufferCV,
  ClarityType,
  ClarityValue,
  ContractIdString,
  ContractPrincipalCV,
  FalseCV,
  IntCV,
  NoneCV,
  ResponseErrorCV,
  ResponseOkCV,
  SomeCV,
  StandardPrincipalCV,
  StringAsciiCV,
  StringUtf8CV,
  TrueCV,
  UIntCV,
} from '@stacks/transactions-v7';
import { z } from 'zod';

// Clarity values
export const cvIntSchema: z.ZodType<IntCV> = z.object({
  type: z.literal('int') as z.ZodLiteral<ClarityType.Int>,
  value: z.coerce.string(),
});

export const cvUintSchema: z.ZodType<UIntCV> = z.object({
  type: z.literal('uint') as z.ZodLiteral<ClarityType.UInt>,
  value: z.coerce.string(),
});

export const cvBufferSchema: z.ZodType<BufferCV> = z.object({
  type: z.literal('buffer') as z.ZodLiteral<ClarityType.Buffer>,
  value: z.string(),
});

export const cvTrueSchema: z.ZodType<TrueCV> = z.object({
  type: z.literal('true') as z.ZodLiteral<ClarityType.BoolTrue>,
});

export const cvFalseSchema: z.ZodType<FalseCV> = z.object({
  type: z.literal('false') as z.ZodLiteral<ClarityType.BoolFalse>,
});

export const cvAddressSchema: z.ZodType<StandardPrincipalCV> = z.object({
  type: z.literal('address') as z.ZodLiteral<ClarityType.PrincipalStandard>,
  value: z.string(),
});

export const cvContractSchema: z.ZodType<ContractPrincipalCV> = z.object({
  type: z.literal('contract') as z.ZodLiteral<ClarityType.PrincipalContract>,
  value: z.string().refine(value => value.includes('.'), {
    message: 'Stacks contract principals are denoted with a dot',
  }) as z.ZodType<ContractIdString>,
});

export const cvAsciiSchema: z.ZodType<StringAsciiCV> = z.object({
  type: z.literal('ascii') as z.ZodLiteral<ClarityType.StringASCII>,
  value: z.string(),
});

export const cvUtf8Schema: z.ZodType<StringUtf8CV> = z.object({
  type: z.literal('utf8') as z.ZodLiteral<ClarityType.StringUTF8>,
  value: z.string(),
});

export const cvOkSchema: z.ZodType<ResponseOkCV> = z
  .object({
    type: z.literal('ok') as z.ZodLiteral<ClarityType.ResponseOk>,
    value: z.lazy(() => clarityValueSchema),
  })
  .transform(value => value as ResponseOkCV);

export const cvErrSchema: z.ZodType<ResponseErrorCV> = z.object({
  type: z.literal('err') as z.ZodLiteral<ClarityType.ResponseErr>,
  value: z.lazy(() => clarityValueSchema),
});

export const cvNoneSchema: z.ZodType<NoneCV> = z.object({
  type: z.literal('none') as z.ZodLiteral<ClarityType.OptionalNone>,
});

export const cvSomeSchema: z.ZodType<SomeCV> = z.object({
  type: z.literal('some') as z.ZodLiteral<ClarityType.OptionalSome>,
  value: z.lazy(() => clarityValueSchema),
});

export const cvListSchema = z.object({
  type: z.literal('list') as z.ZodLiteral<ClarityType.List>,
  value: z.array(z.lazy(() => clarityValueSchema)),
});

export const cvTupleSchema = z.object({
  type: z.literal('tuple') as z.ZodLiteral<ClarityType.Tuple>,
  value: z.record(z.lazy(() => clarityValueSchema)),
});

export const clarityValueSchema: z.ZodType<ClarityValue> = z.union([
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
