import { hexToBytes } from '@noble/hashes/utils';
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
  getBitcoinCoinTypeIndexByNetwork,
} from '../utils/bitcoin.utils';

export function makeNativeSegwitAccountDerivationPath(
  network: BitcoinNetworkModes,
  accountIndex: number
) {
  return `m/84'/${getBitcoinCoinTypeIndexByNetwork(network)}'/${accountIndex}'`;
}

export function makeNativeSegwitAddressIndexDerivationPath({
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
    makeNativeSegwitAccountDerivationPath(network, accountIndex) + `/${changeIndex}/${addressIndex}`
  );
}

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

export function getNativeSegwitPaymentFromAddressIndex(
  keychain: HDKey,
  network: BitcoinNetworkModes
) {
  if (keychain.depth !== DerivationPathDepth.AddressIndex)
    throw new Error('Keychain passed is not an address index');

  if (!keychain.publicKey) throw new Error('Keychain does not have a public key');

  return btc.p2wpkh(keychain.publicKey, getBtcSignerLibNetworkConfigByMode(network));
}

// Derives the p2wpkh (native segwit) address for a compressed public key
export function getP2wpkhAddressFromPublicKey(
  publicKey: string,
  network: BitcoinNetworkModes
): string {
  const { address } = btc.p2wpkh(
    hexToBytes(publicKey),
    getBtcSignerLibNetworkConfigByMode(network)
  );
  if (!address) throw new Error('Could not derive p2wpkh address from public key');
  return address;
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
    payment: getNativeSegwitPaymentFromAddressIndex(zeroAddressIndex, network),
  };
}

export function getNativeSegwitAddress({
  changeIndex,
  addressIndex,
  keychain,
  network,
}: GetAddressArgs) {
  if (!keychain) throw new Error('Expected keychain to be provided');

  if (keychain.depth !== DerivationPathDepth.Account)
    throw new Error('Expects keychain to be on the account index');

  const addressKeychain = deriveAddressIndexKeychainFromAccount(keychain)({
    changeIndex,
    addressIndex,
  });

  if (!addressKeychain.publicKey) throw new Error('Expected publicKey to be defined');

  const payment = getNativeSegwitPaymentFromAddressIndex(addressKeychain, network);

  if (!payment.address) throw new Error('Expected address to be defined');
  return payment.address;
}
