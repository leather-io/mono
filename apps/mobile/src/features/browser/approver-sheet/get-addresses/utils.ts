import { bytesToHex } from '@stacks/common';

import { ecdsaPublicKeyToSchnorr, encodeExtendedPublicKeyForNetwork } from '@leather.io/bitcoin';
import { type BitcoinNetworkModes } from '@leather.io/models';
import { type BtcAddress, type StxAddress, getAddresses } from '@leather.io/rpc';

interface FormatAddressesForGetAddresses {
  fingerprint: string;
  taproot: {
    address: string;
    publicKey: Uint8Array;
    derivationPath: string;
    xpub: string;
  };
  nativeSegwit: {
    address: string;
    publicKey: Uint8Array;
    derivationPath: string;
    xpub: string;
  };
  stacksAccount: {
    address: string;
    publicKey: Uint8Array;
  };
  bitcoinNetworkMode: BitcoinNetworkModes;
}

// We could think of making the arguments optional here.
export function formatAddressesForGetAddresses({
  fingerprint,
  taproot,
  nativeSegwit,
  stacksAccount,
  bitcoinNetworkMode,
}: FormatAddressesForGetAddresses) {
  const keysToIncludeInResponse = [];
  const nativeSegwitAddressResponse: BtcAddress = {
    symbol: 'BTC',
    type: 'p2wpkh',
    address: nativeSegwit.address,
    publicKey: bytesToHex(nativeSegwit.publicKey),
    derivationPath: nativeSegwit.derivationPath,
    descriptor: `wpkh(${encodeExtendedPublicKeyForNetwork(nativeSegwit.xpub, bitcoinNetworkMode)})`,
    fingerprint,
  };

  keysToIncludeInResponse.push(nativeSegwitAddressResponse);

  const taprootAddressResponse: BtcAddress = {
    symbol: 'BTC',
    type: 'p2tr',
    address: taproot.address,
    publicKey: bytesToHex(taproot.publicKey),
    tweakedPublicKey: bytesToHex(ecdsaPublicKeyToSchnorr(taproot.publicKey)),
    derivationPath: taproot.derivationPath,
    descriptor: `tr(${encodeExtendedPublicKeyForNetwork(taproot.xpub, bitcoinNetworkMode)})`,
    fingerprint,
  };
  keysToIncludeInResponse.push(taprootAddressResponse);

  const stacksAddressResponse: StxAddress = {
    symbol: 'STX',
    kind: 'single-sig',
    address: stacksAccount.address,
    publicKey: bytesToHex(stacksAccount.publicKey),
  };

  keysToIncludeInResponse.push(stacksAddressResponse);

  return getAddresses.result.shape.addresses.parse(keysToIncludeInResponse);
}
