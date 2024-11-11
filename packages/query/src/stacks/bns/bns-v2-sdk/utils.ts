import {
  getAddressFromPrivateKey,
  makeRandomPrivKey,
  privateKeyToString,
} from '@stacks/transactions';

export function generateRandomAddress() {
  const randomPrivateKey = makeRandomPrivKey();
  const privateKeyString = privateKeyToString(randomPrivateKey);
  const randomAddress = getAddressFromPrivateKey(privateKeyString);

  return randomAddress;
}
