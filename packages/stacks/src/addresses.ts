import { getAddressFromPrivateKey, makeRandomPrivKey } from '@stacks/transactions';

export function generateRandomStacksAddress() {
  const randomPrivateKey = makeRandomPrivKey();
  const privateKeyString = randomPrivateKey;
  const randomAddress = getAddressFromPrivateKey(privateKeyString);
  return randomAddress;
}
