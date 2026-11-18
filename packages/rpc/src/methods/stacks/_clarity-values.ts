import {
  type BufferCV,
  ClarityType,
  type ClarityValue,
  type ContractIdString,
  type ContractPrincipalCV,
  type FalseCV,
  type IntCV,
  type NoneCV,
  type ResponseErrorCV,
  type ResponseOkCV,
  type SomeCV,
  type StandardPrincipalCV,
  type StringAsciiCV,
  type StringUtf8CV,
  type TrueCV,
  type UIntCV,
} from '@stacks/transactions';
import { z } from 'zod';

// Clarity values
export const cvIntSchema: z.ZodType<IntCV> = z.object({
  type: z.literal(ClarityType.Int),
  value: z.coerce.string(),
});

export const cvUintSchema: z.ZodType<UIntCV> = z.object({
  type: z.literal(ClarityType.UInt),
  value: z.coerce.string(),
});

export const cvBufferSchema: z.ZodType<BufferCV> = z.object({
  type: z.literal(ClarityType.Buffer),
  value: z.string(),
});

export const cvTrueSchema: z.ZodType<TrueCV> = z.object({
  type: z.literal(ClarityType.BoolTrue),
});

export const cvFalseSchema: z.ZodType<FalseCV> = z.object({
  type: z.literal(ClarityType.BoolFalse),
});

export const cvAddressSchema: z.ZodType<StandardPrincipalCV> = z.object({
  type: z.literal(ClarityType.PrincipalStandard),
  value: z.string(),
});

export const cvContractSchema: z.ZodType<ContractPrincipalCV> = z.object({
  type: z.literal(ClarityType.PrincipalContract),
  value: z.string().pipe(
    z.custom<ContractIdString>(value => typeof value === 'string' && value.includes('.'), {
      message: 'Stacks contract principals are denoted with a dot',
    })
  ),
});

export const cvAsciiSchema: z.ZodType<StringAsciiCV> = z.object({
  type: z.literal(ClarityType.StringASCII),
  value: z.string(),
});

export const cvUtf8Schema: z.ZodType<StringUtf8CV> = z.object({
  type: z.literal(ClarityType.StringUTF8),
  value: z.string(),
});

export const cvOkSchema: z.ZodType<ResponseOkCV> = z
  .object({
    type: z.literal(ClarityType.ResponseOk),
    value: z.lazy(() => clarityValueSchema),
  })
  .transform((value): ResponseOkCV => value);

export const cvErrSchema: z.ZodType<ResponseErrorCV> = z.object({
  type: z.literal(ClarityType.ResponseErr),
  value: z.lazy(() => clarityValueSchema),
});

export const cvNoneSchema: z.ZodType<NoneCV> = z.object({
  type: z.literal(ClarityType.OptionalNone),
});

export const cvSomeSchema: z.ZodType<SomeCV> = z.object({
  type: z.literal(ClarityType.OptionalSome),
  value: z.lazy(() => clarityValueSchema),
});

export const cvListSchema = z.object({
  type: z.literal(ClarityType.List),
  value: z.array(z.lazy(() => clarityValueSchema)),
});

export const cvTupleSchema = z.object({
  type: z.literal(ClarityType.Tuple),
  value: z.record(
    z.string(),
    z.lazy(() => clarityValueSchema)
  ),
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
