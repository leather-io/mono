import { ChainId } from '@stacks/network';
import {
  AddressHashMode,
  AddressVersion,
  addressFromPublicKeys,
  addressToString,
  createStacksPublicKey,
  getAddressFromPrivateKey,
  makeRandomPrivKey,
} from '@stacks/transactions';

import { whenStacksChainId } from './stacks.utils';

export function generateRandomStacksAddress() {
  const randomPrivateKey = makeRandomPrivKey();
  const privateKeyString = randomPrivateKey;
  const randomAddress = getAddressFromPrivateKey(privateKeyString);
  return randomAddress;
}

interface DeriveStxMultisigAddressArgs {
  publicKeys: string[];
  threshold: number;
  chainId: number;
}

// Derives the c32 multisig address (SM… mainnet / SN… testnet) for an ordered
// set of compressed public keys and an m-of-n threshold. Uses the
// P2SHNonSequential hash mode so signers may sign in any order. The public key
// order is part of the address identity and must NOT be sorted here.
export function deriveStxMultisigAddress({
  publicKeys,
  threshold,
  chainId,
}: DeriveStxMultisigAddressArgs): string {
  const version = whenStacksChainId(chainId)({
    [ChainId.Mainnet]: AddressVersion.MainnetMultiSig,
    [ChainId.Testnet]: AddressVersion.TestnetMultiSig,
  });
  return addressToString(
    addressFromPublicKeys(
      version,
      AddressHashMode.P2SHNonSequential,
      threshold,
      publicKeys.map(createStacksPublicKey)
    )
  );
}
