import { hexToBytes } from '@noble/hashes/utils';
import {
  BytesReader,
  NonFungiblePostCondition,
  StxPostCondition,
  deserializePostConditionWire,
  hexToCV,
  postConditionToHex,
} from '@stacks/transactions';

export const mockNftPostCondrtion: NonFungiblePostCondition = {
  type: 'nft-postcondition',
  address: 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW',
  condition: 'sent',
  asset: 'ST248HH800501WYSG7Z2SS1ZWHQW1GGH85Q6YJBCC.passive-blue-marmot::layer-nft',
  assetId: hexToCV('0x0100000000000000000000000000000003'),
};

export const mockStxPostCondition: StxPostCondition = {
  type: 'stx-postcondition',
  address: 'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW',
  condition: 'eq',
  amount: 100000000,
};

export const mockPostConditionHex = postConditionToHex(mockStxPostCondition);

export const mockPostConditionBytes = hexToBytes(mockPostConditionHex);

export const mockDeserializedPostCondition = deserializePostConditionWire(
  new BytesReader(hexToBytes(mockPostConditionHex))
);
