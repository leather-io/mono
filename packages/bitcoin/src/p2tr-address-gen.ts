import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';

import { DerivationPathDepth } from '@leather.io/crypto';
import { BitcoinNetworkModes } from '@leather.io/models';

import { getBtcSignerLibNetworkConfigByMode } from './bitcoin.network';
import {
  BitcoinAccount,
  deriveAddressIndexZeroFromAccount,
  ecdsaPublicKeyToSchnorr,
  getBitcoinCoinTypeIndexByNetwork,
} from './bitcoin.utils';

export function makeTaprootAccountDerivationPath(
  network: BitcoinNetworkModes,
  accountIndex: number
) {
  return `m/86'/${getBitcoinCoinTypeIndexByNetwork(network)}'/${accountIndex}'`;
}
/** @deprecated Use makeTaprootAccountDerivationPath */
export const getTaprootAccountDerivationPath = makeTaprootAccountDerivationPath;

export function makeTaprootAddressIndexDerivationPath(
  network: BitcoinNetworkModes,
  accountIndex: number,
  addressIndex: number
) {
  return makeTaprootAccountDerivationPath(network, accountIndex) + `/0/${addressIndex}`;
}
/** @deprecated Use makeTaprootAddressIndexDerivationPath */
export const getTaprootAddressIndexDerivationPath = makeTaprootAddressIndexDerivationPath;

export function deriveTaprootAccount(keychain: HDKey, network: BitcoinNetworkModes) {
  if (keychain.depth !== DerivationPathDepth.Root)
    throw new Error('Keychain passed is not an account');

  return (accountIndex: number): BitcoinAccount => ({
    type: 'p2tr',
    network,
    accountIndex,
    derivationPath: makeTaprootAccountDerivationPath(network, accountIndex),
    keychain: keychain.derive(makeTaprootAccountDerivationPath(network, accountIndex)),
  });
}

export function getTaprootPayment(publicKey: Uint8Array, network: BitcoinNetworkModes) {
  return btc.p2tr(
    ecdsaPublicKeyToSchnorr(publicKey),
    undefined,
    getBtcSignerLibNetworkConfigByMode(network)
  );
}

export function getTaprootPaymentFromAddressIndex(keychain: HDKey, network: BitcoinNetworkModes) {
  if (keychain.depth !== DerivationPathDepth.AddressIndex)
    throw new Error('Keychain passed is not an address index');

  if (!keychain.publicKey) throw new Error('Keychain has no public key');

  return getTaprootPayment(keychain.publicKey, network);
}

interface DeriveTaprootReceiveAddressIndexArgs {
  xpub: string;
  network: BitcoinNetworkModes;
}
export function deriveTaprootReceiveAddressIndex({
  xpub,
  network,
}: DeriveTaprootReceiveAddressIndexArgs) {
  const keychain = HDKey.fromExtendedKey(xpub);
  const zeroAddressIndex = deriveAddressIndexZeroFromAccount(keychain);
  return getTaprootPaymentFromAddressIndex(zeroAddressIndex, network);
}
