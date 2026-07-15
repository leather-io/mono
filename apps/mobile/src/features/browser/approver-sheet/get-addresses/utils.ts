import { bytesToHex } from '@stacks/common';

import { ecdsaPublicKeyToSchnorr } from '@leather.io/bitcoin';
import { BtcAddress, StxAddress, getAddresses } from '@leather.io/rpc';

interface FormatAddressesForGetAddresses {
  fingerprint: string;
  taproot: {
    address: string;
    publicKey: Uint8Array;
    derivationPath: string;
    descriptor?: string;
  };
  nativeSegwit: {
    address: string;
    publicKey: Uint8Array;
    derivationPath: string;
    descriptor?: string;
  };
  stacksAccount: {
    address: string;
    publicKey: Uint8Array;
  };
}

// We could think of making the arguments optional here.
export function formatAddressesForGetAddresses({
  fingerprint,
  taproot,
  nativeSegwit,
  stacksAccount,
}: FormatAddressesForGetAddresses) {
  const keysToIncludeInResponse = [];
  const nativeSegwitAddressResponse: BtcAddress = {
    symbol: 'BTC',
    type: 'p2wpkh',
    address: nativeSegwit.address,
    publicKey: bytesToHex(nativeSegwit.publicKey),
    derivationPath: nativeSegwit.derivationPath,
    descriptor: nativeSegwit.descriptor ?? '',
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
    descriptor: taproot.descriptor ?? '',
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
