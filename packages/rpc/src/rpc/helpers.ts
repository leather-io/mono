import { z } from 'zod';

import { isNumberOrNumberList, isUndefined } from '@leather.io/utils';

export function testIsNumberOrArrayOfNumbers(value: unknown) {
  if (isUndefined(value)) return true;
  return isNumberOrNumberList(value);
}

export function createRequestEncoder<T extends z.ZodTypeAny>(schema: T) {
  function encode(request: z.infer<T>) {
    const jsonString = JSON.stringify(schema.parse(request));
    return btoa(jsonString);
  }

  function decode(encodedRequest: string): z.infer<T> {
    const jsonString = atob(encodedRequest);
    return schema.parse(JSON.parse(jsonString));
  }

  return { encode, decode };
}
