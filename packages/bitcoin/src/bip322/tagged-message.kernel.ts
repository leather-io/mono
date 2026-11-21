import { hexToBytes } from '@noble/hashes/utils';

import { constant, thenRestAsBytes, thenRestAsText } from '@leather.io/kernel';

const doubledMessageTagHash = hexToBytes(
  '746584a1872fa10041554effa038d6124942dd79b4e58a4cda184e13dbe62c49746584a1872fa10041554effa038d6124942dd79b4e58a4cda184e13dbe62c49'
);

export const taggedMessageBytes = thenRestAsBytes(constant(doubledMessageTagHash));
export const taggedMessageText = thenRestAsText(constant(doubledMessageTagHash));
