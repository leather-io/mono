import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import {
  BytesReader,
  FungibleConditionCode,
  NonFungibleConditionCode,
  createAssetInfo,
  deserializePostCondition,
  hexToCV,
  makeStandardNonFungiblePostCondition,
  makeStandardSTXPostCondition,
  serializePostCondition,
} from '@stacks/transactions';

export const mockNftPostCondition = makeStandardNonFungiblePostCondition(
  'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW',
  NonFungibleConditionCode.Sends,
  createAssetInfo('ST248HH800501WYSG7Z2SS1ZWHQW1GGH85Q6YJBCC', 'passive-blue-marmot', 'layer-nft'),
  hexToCV('0x0100000000000000000000000000000003')
);

export const mockStxPostCondition = makeStandardSTXPostCondition(
  'ST2PABAF9FTAJYNFZH93XENAJ8FVY99RRM4DF2YCW',
  FungibleConditionCode.Equal,
  BigInt(100000000)
);

export const mockPostConditionBytes = serializePostCondition(mockStxPostCondition);
export const mockPostConditionHex = bytesToHex(mockPostConditionBytes);
export const mockDeserializedPostCondition = deserializePostCondition(
  new BytesReader(hexToBytes(mockPostConditionHex))
);
