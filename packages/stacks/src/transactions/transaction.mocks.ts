import { hexToBytes } from '@noble/hashes/utils';
import {
  BytesReader,
  StxPostCondition,
  deserializePostConditionWire,
  postConditionToHex,
} from '@stacks/transactions';

export const mockStxPostCondition: StxPostCondition = {
  type: 'stx-postcondition',
  address: 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW',
  condition: 'eq',
  amount: 100000000,
};

export const mockPostConditionHex = postConditionToHex(mockStxPostCondition);

export const mockDeserializedPostCondition = deserializePostConditionWire(
  new BytesReader(hexToBytes(mockPostConditionHex))
);
