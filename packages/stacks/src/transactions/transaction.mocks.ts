import { hexToBytes } from '@noble/hashes/utils';
import {
  BytesReader,
  PoxPostCondition,
  StakingPostCondition,
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

const mockStakingPostCondition: StakingPostCondition = {
  type: 'staking-postcondition',
  address: 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW',
  condition: 'gte',
  amount: 100000000,
};

export const mockStakingPostConditionHex = postConditionToHex(mockStakingPostCondition);

export const mockDeserializedStakingPostCondition = deserializePostConditionWire(
  new BytesReader(hexToBytes(mockStakingPostConditionHex))
);

const mockPoxPostCondition: PoxPostCondition = {
  type: 'pox-postcondition',
  address: 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW',
  condition: 'will-not-perform',
};

export const mockPoxPostConditionHex = postConditionToHex(mockPoxPostCondition);

export const mockDeserializedPoxPostCondition = deserializePostConditionWire(
  new BytesReader(hexToBytes(mockPoxPostConditionHex))
);
