import { hexToBytes } from '@noble/hashes/utils';
import * as P from 'micro-packed';

import { strictText } from '@leather.io/utils/kernel';

const doubledMessageTagHash = hexToBytes(
  '746584a1872fa10041554effa038d6124942dd79b4e58a4cda184e13dbe62c49746584a1872fa10041554effa038d6124942dd79b4e58a4cda184e13dbe62c49'
);

export const taggedMessageBytes = P.tuple([P.magicBytes(doubledMessageTagHash), P.bytes(null)]);
export const taggedMessageText = P.tuple([P.magicBytes(doubledMessageTagHash), strictText(null)]);
