import { postConditionToWire } from '@stacks/transactions';
import { describe, expect, it, vi } from 'vitest';

import { isString } from '@leather.io/utils';

import * as PostConditionModule from './post-condition.utils';
import {
  mockDeserializedPostCondition,
  mockPostConditionHex,
  mockStxPostCondition,
} from './transaction.mocks';

vi.mock('@leather.io/utils', () => ({ isString: vi.fn() }));

describe('getPostConditionFromString', () => {
  it('should return post condition if it is a valid pc hex string', () => {
    const result = PostConditionModule.getPostConditionFromString(mockPostConditionHex);
    expect(result).toStrictEqual(mockDeserializedPostCondition);
  });

  it('should throw an error if not a valid pc hex string', () => {
    const mockInvalidHex = 'abcd1234';
    expect(() => PostConditionModule.getPostConditionFromString(mockInvalidHex)).toThrow(
      'Not a serialized post condition'
    );
  });
});

describe('getPostCondition', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return post condition if it is a valid pc hex string', () => {
    (isString as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);
    const result = PostConditionModule.getPostCondition(mockPostConditionHex);
    expect(isString).toHaveBeenCalledWith(mockPostConditionHex);
    expect(result).toStrictEqual(mockDeserializedPostCondition);
  });

  it('should throw an error if not a valid pc hex string', () => {
    const mockInvalidHex = 'abcd1234';
    (isString as unknown as ReturnType<typeof vi.fn>).mockReturnValue(true);
    try {
      PostConditionModule.getPostCondition(mockInvalidHex);
    } catch (err) {
      expect(isString).toHaveBeenCalledWith(mockInvalidHex);
      expect((err as Error).message).toBe('Not a serialized post condition');
    }
  });

  it('should return post condition directly if already a PostCondition object', () => {
    (isString as unknown as ReturnType<typeof vi.fn>).mockReturnValue(false);
    const result = PostConditionModule.getPostCondition(mockStxPostCondition);
    expect(result).toStrictEqual(postConditionToWire(mockStxPostCondition));
  });
});
