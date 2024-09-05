import {
  AddressVersion,
  createStacksPrivateKey,
  getPublicKey,
  publicKeyToAddress,
} from '@stacks/transactions';
import { deriveStxPrivateKey } from '@stacks/wallet-sdk';

import {
  deriveNativeSegwitAccountFromRootKeychain,
  deriveTaprootAccount,
  mnemonicToRootNode,
} from '@leather.io/bitcoin';

const secretKey = process.env.EXPO_PUBLIC_SECRET_KEY ?? '';

export function getStacksAddressByIndex(secretKey: string, addressVersion: AddressVersion) {
  return (index: number) => {
    const accountPrivateKey = createStacksPrivateKey(
      deriveStxPrivateKey({ rootNode: mnemonicToRootNode(secretKey) as any, index })
    );
    const pubKey = getPublicKey(accountPrivateKey);
    return publicKeyToAddress(addressVersion, pubKey);
  };
}

export function getDummyKeys() {
  const rootNode = mnemonicToRootNode(secretKey);
  const nativeSegwitAccount = deriveNativeSegwitAccountFromRootKeychain(rootNode, 'mainnet')(0);
  const taprootAccount = deriveTaprootAccount(rootNode, 'mainnet')(0);
  const stxAddress = getStacksAddressByIndex(secretKey, AddressVersion.MainnetSingleSig)(0);

  return {
    mnemonic: secretKey,
    rootNode,
    nativeSegwitAccount,
    taprootAccount,
    stxAddress,
  };
}
