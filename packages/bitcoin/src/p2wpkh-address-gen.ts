import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';

import { DerivationPathDepth } from '@leather.io/crypto';
import { BitcoinNetworkModes } from '@leather.io/models';

import { getBtcSignerLibNetworkConfigByMode } from './bitcoin.network';
import {
  BitcoinAccount,
  deriveAddressIndexZeroFromAccount,
  getBitcoinCoinTypeIndexByNetwork,
} from './bitcoin.utils';

export function makeNativeSegwitAccountDerivationPath(
  network: BitcoinNetworkModes,
  accountIndex: number
) {
  return `m/84'/${getBitcoinCoinTypeIndexByNetwork(network)}'/${accountIndex}'`;
}
/** @deprecated Use makeNativeSegwitAccountDerivationPath */
export const getNativeSegwitAccountDerivationPath = makeNativeSegwitAccountDerivationPath;

export function makeNativeSegwitAddressIndexDerivationPath(
  network: BitcoinNetworkModes,
  accountIndex: number,
  addressIndex: number
) {
  return makeNativeSegwitAccountDerivationPath(network, accountIndex) + `/0/${addressIndex}`;
}
/** @deprecated Use makeNativeSegwitAddressIndexDerivationPath */
export const getNativeSegwitAddressIndexDerivationPath = makeNativeSegwitAddressIndexDerivationPath;

export function deriveNativeSegwitAccountFromRootKeychain(
  keychain: HDKey,
  network: BitcoinNetworkModes
) {
  if (keychain.depth !== DerivationPathDepth.Root) throw new Error('Keychain passed is not a root');
  return (accountIndex: number): BitcoinAccount => ({
    type: 'p2wpkh',
    network,
    accountIndex,
    derivationPath: makeNativeSegwitAccountDerivationPath(network, accountIndex),
    keychain: keychain.derive(makeNativeSegwitAccountDerivationPath(network, accountIndex)),
  });
}

export function getNativeSegWitPaymentFromAddressIndex(
  keychain: HDKey,
  network: BitcoinNetworkModes
) {
  if (keychain.depth !== DerivationPathDepth.AddressIndex)
    throw new Error('Keychain passed is not an address index');

  if (!keychain.publicKey) throw new Error('Keychain does not have a public key');

  return btc.p2wpkh(keychain.publicKey, getBtcSignerLibNetworkConfigByMode(network));
}

interface DeriveNativeSegwitReceiveAddressIndexArgs {
  keychain: HDKey;
  network: BitcoinNetworkModes;
}
export function deriveNativeSegwitReceiveAddressIndexZero({
  keychain,
  network,
}: DeriveNativeSegwitReceiveAddressIndexArgs) {
  const zeroAddressIndex = deriveAddressIndexZeroFromAccount(keychain);
  return {
    keychain: zeroAddressIndex,
    payment: getNativeSegWitPaymentFromAddressIndex(zeroAddressIndex, network),
  };
}
