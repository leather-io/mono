import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';

import { DerivationPathDepth } from '@leather.io/crypto';
import { BitcoinNetworkModes } from '@leather.io/models';

import { getBtcSignerLibNetworkConfigByMode } from '../utils/bitcoin.network';
import {
  BitcoinAccount,
  GetAddressArgs,
  deriveAddressIndexKeychainFromAccount,
  deriveAddressIndexZeroFromAccount,
  ecdsaPublicKeyToSchnorr,
  getBitcoinCoinTypeIndexByNetwork,
} from '../utils/bitcoin.utils';

export function makeTaprootAccountDerivationPath(
  network: BitcoinNetworkModes,
  accountIndex: number
) {
  return `m/86'/${getBitcoinCoinTypeIndexByNetwork(network)}'/${accountIndex}'`;
}
export function makeTaprootAddressIndexDerivationPath({
  network,
  accountIndex,
  changeIndex,
  addressIndex,
}: {
  network: BitcoinNetworkModes;
  accountIndex: number;
  changeIndex: number;
  addressIndex: number;
}) {
  return (
    makeTaprootAccountDerivationPath(network, accountIndex) + `/${changeIndex}/${addressIndex}`
  );
}
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
    getBtcSignerLibNetworkConfigByMode(network),
    true // allow unknown outputs
  );
}

export function getTaprootPaymentFromAddressIndex(keychain: HDKey, network: BitcoinNetworkModes) {
  if (keychain.depth !== DerivationPathDepth.AddressIndex)
    throw new Error('Keychain passed is not an address index');

  if (!keychain.publicKey) throw new Error('Keychain has no public key');

  return getTaprootPayment(keychain.publicKey, network);
}

interface DeriveTaprootReceiveAddressIndexArgs {
  keychain: HDKey;
  network: BitcoinNetworkModes;
}
export function deriveTaprootReceiveAddressIndexZero({
  keychain,
  network,
}: DeriveTaprootReceiveAddressIndexArgs) {
  const zeroAddressIndex = deriveAddressIndexZeroFromAccount(keychain);
  return {
    keychain: zeroAddressIndex,
    payment: getTaprootPaymentFromAddressIndex(zeroAddressIndex, network),
  };
}

export function getTaprootAddress({
  changeIndex,
  addressIndex,
  keychain,
  network,
}: GetAddressArgs) {
  if (!keychain) throw new Error('Expected keychain to be provided');

  if (keychain.depth !== DerivationPathDepth.Account)
    throw new Error('Expects keychain to be on the account index');

  const addresskeychain = deriveAddressIndexKeychainFromAccount(keychain)({
    changeIndex,
    addressIndex,
  });

  if (!addresskeychain.publicKey) throw new Error('Expected publicKey to be defined');

  const payment = getTaprootPayment(addresskeychain.publicKey, network);

  if (!payment.address) throw new Error('Expected address to be defined');
  return payment.address;
}
