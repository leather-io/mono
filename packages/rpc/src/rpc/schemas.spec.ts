import { z } from 'zod';

import {
  createRpcErrorResponseSchema,
  createRpcSuccessResponseSchema,
  rpcBasePropsSchema,
} from './schemas';

const baseRequestData = { jsonrpc: '2.0', id: '1' };

describe('RPC method schemas', () => {
  test('the base RPC schema', () => {
    expect(rpcBasePropsSchema.safeParse(baseRequestData).success).toEqual(true);
  });

  describe(createRpcSuccessResponseSchema.name, () => {
    test('validates a successful response with basic result object', () => {
      const schema = createRpcSuccessResponseSchema(z.object({ value: z.string() }));
      const validResponse = { ...baseRequestData, result: { value: 'test' } };

      expect(schema.safeParse(validResponse).success).toBe(true);
    });

    test('fails validation when missing required RPC base properties', () => {
      const schema = createRpcSuccessResponseSchema(z.object({ value: z.string() }));
      const invalidResponse = { result: { value: 'test' } };

      expect(schema.safeParse(invalidResponse).success).toBe(false);
    });

    test('fails validation when result does not match schema', () => {
      const schema = createRpcSuccessResponseSchema(z.object({ value: z.number() }));
      const invalidResponse = { ...baseRequestData, result: { value: 'not a number' } };

      expect(schema.safeParse(invalidResponse).success).toBe(false);
    });
  });

  describe(createRpcErrorResponseSchema.name, () => {
    const rpcErrorSchema = z.object({
      code: z.number(),
      message: z.string(),
      data: z.object({}).optional(),
    });

    test('validates error response with basic error object', () => {
      const schema = createRpcErrorResponseSchema(rpcErrorSchema);
      const validResponse = {
        ...baseRequestData,
        error: {
          code: -32600,
          message: 'Invalid Request',
        },
      };

      expect(schema.safeParse(validResponse).success).toBe(true);
    });

    test('validates error response with optional error data', () => {
      const schema = createRpcErrorResponseSchema(rpcErrorSchema);
      const validResponse = {
        ...baseRequestData,
        error: {
          code: -32603,
          message: 'Internal error',
          data: { details: 'Database connection failed' },
        },
      };

      expect(schema.safeParse(validResponse).success).toBe(true);
    });

    test('fails validation when missing required RPC properties', () => {
      const schema = createRpcErrorResponseSchema(rpcErrorSchema);
      const invalidResponse = {
        error: {
          code: -32600,
          message: 'Invalid Request',
        },
      };
      expect(schema.safeParse(invalidResponse).success).toBe(false);
    });

    test('fails validation with invalid error code', () => {
      const schema = createRpcErrorResponseSchema(rpcErrorSchema);
      const invalidResponse = {
        ...baseRequestData,
        error: {
          code: 'not-a-number',
          message: 'Invalid Request',
        },
      };

      expect(schema.safeParse(invalidResponse).success).toBe(false);
    });

    test('fails validation when missing error message', () => {
      const schema = createRpcErrorResponseSchema(rpcErrorSchema);
      const invalidResponse = {
        ...baseRequestData,
        error: { code: -32600 },
      };

      expect(schema.safeParse(invalidResponse).success).toBe(false);
    });
  });
});
