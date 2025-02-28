import { z } from 'zod';

import { isNumberOrNumberList, isUndefined } from '@leather.io/utils';

export function testIsNumberOrArrayOfNumbers(value: unknown) {
  if (isUndefined(value)) return true;
  return isNumberOrNumberList(value);
}

export function encodeBase64Json(payload: Record<any, unknown>) {
  const jsonString = JSON.stringify(payload);
  return btoa(jsonString);
}

export function decodeBase64Json(encodedPayload: string): unknown {
  const jsonString = atob(encodedPayload);
  return JSON.parse(jsonString);
}

export function createRequestEncoder<T extends z.ZodTypeAny>(schema: T) {
  function encode(request: z.infer<T>) {
    return encodeBase64Json(schema.parse(request));
  }

  function decode(encodedRequest: string): z.infer<T> {
    const parsedJson = decodeBase64Json(encodedRequest);
    return schema.parse(parsedJson);
  }

  return { encode, decode };
}
