import { stringAsciiCV, tupleCV, uintCV } from '@stacks/transactions';

export function buildLeatherSignInMessage(timestamp: number) {
  return stringAsciiCV(`Sign in to Leather\n${timestamp}`);
}

export function buildLeatherSignInDomain() {
  return tupleCV({
    name: stringAsciiCV('Leather'),
    version: stringAsciiCV('1.0.0'),
    'chain-id': uintCV(1),
  });
}
