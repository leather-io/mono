import { hexToBytes } from '@noble/hashes/utils';
import {
  BytesReader,
  PostCondition,
  PostConditionWire,
  deserializePostConditionWire,
  postConditionToWire,
} from '@stacks/transactions';

import { isString } from '@leather.io/utils';

export function getPostConditionFromString(postCondition: string): PostConditionWire {
  try {
    const reader = new BytesReader(hexToBytes(postCondition));
    return deserializePostConditionWire(reader);
  } catch {
    // TODO use StacksError
    throw new Error('Not a serialized post condition');
  }
}

export function ensurePostConditionWireFormat(
  postCondition: string | PostCondition | PostConditionWire
) {
  if (isString(postCondition)) return getPostConditionFromString(postCondition);
  if ('conditionType' in postCondition) return postCondition;
  return postConditionToWire(postCondition);
}

export function getPostCondition(
  postCondition: string | PostCondition | PostConditionWire
): PostConditionWire {
  return isString(postCondition)
    ? getPostConditionFromString(postCondition)
    : ensurePostConditionWireFormat(postCondition);
}

export function getPostConditions(
  postConditions?: (string | PostCondition | PostConditionWire)[]
): PostConditionWire[] | undefined {
  return postConditions?.map(getPostCondition);
}
