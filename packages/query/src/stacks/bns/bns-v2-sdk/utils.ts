import { getAddressFromPrivateKey, randomPrivateKey } from '@stacks/transactions';

export function generateRandomAddress() {
  const privateKey = randomPrivateKey();
  return getAddressFromPrivateKey(privateKey);
}
