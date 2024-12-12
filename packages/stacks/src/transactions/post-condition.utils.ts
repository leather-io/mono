import { hexToBytes } from '@noble/hashes/utils';
import { BytesReader, PostCondition, deserializePostCondition } from '@stacks/transactions';

import { isString } from '@leather.io/utils';

export function getPostConditionFromString(postCondition: string): PostCondition {
  try {
    const reader = new BytesReader(hexToBytes(postCondition));
    return deserializePostCondition(reader);
  } catch {
    throw new Error('Not a serialized post condition');
  }
}

export function getPostCondition(postCondition: string | PostCondition): PostCondition {
  return isString(postCondition) ? getPostConditionFromString(postCondition) : postCondition;
}

export function getPostConditions(
  postConditions?: (string | PostCondition)[]
): PostCondition[] | undefined {
  return postConditions?.map(getPostCondition);
}
