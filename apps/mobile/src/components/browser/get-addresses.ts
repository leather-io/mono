import { bytesToHex } from '@stacks/common';
import type { Account } from '@stacks/wallet-sdk';

import { ecdsaPublicKeyToSchnorr } from '@leather.io/bitcoin';
import { BtcAddress, getAddresses } from '@leather.io/rpc';

// Extending the `Account` type from `@stacks/wallet-sdk`
export type SoftwareStacksAccount = Account & {
  type: 'software';
  index: number;
  address: string;
  stxPublicKey: string;
  dataPublicKey: string;
};

export interface HardwareStacksAccount {
  type: 'ledger';
  index: number;
  address: string;
  stxPublicKey: string;
  dataPublicKey: string;
}

export type StacksAccountResponse = SoftwareStacksAccount | HardwareStacksAccount;
// We could think of making the arguments optional here.
export function formatAddressesForGetAddresses({
  taproot,
  nativeSegwit,
  stacksAccount,
}: {
  taproot: {
    address: string;
    publicKey: Uint8Array;
    derivationPath: string;
  };
  nativeSegwit: {
    address: string;
    publicKey: Uint8Array;
    derivationPath: string;
  };
  stacksAccount: {
    address: string;
    publicKey: Uint8Array;
  };
}) {
  const keysToIncludeInResponse = [];
  const nativeSegwitAddressResponse: BtcAddress = {
    symbol: 'BTC',
    type: 'p2wpkh',
    address: nativeSegwit.address,
    publicKey: bytesToHex(nativeSegwit.publicKey),
    derivationPath: nativeSegwit.derivationPath,
  };

  keysToIncludeInResponse.push(nativeSegwitAddressResponse);

  const taprootAddressResponse: BtcAddress = {
    symbol: 'BTC',
    type: 'p2tr',
    address: taproot.address,
    publicKey: bytesToHex(taproot.publicKey),
    tweakedPublicKey: bytesToHex(ecdsaPublicKeyToSchnorr(taproot.publicKey)),
    derivationPath: taproot.derivationPath,
  };
  keysToIncludeInResponse.push(taprootAddressResponse);

  const stacksAddressResponse = {
    symbol: 'STX',
    address: stacksAccount.address,
    publicKey: bytesToHex(stacksAccount.publicKey),
  };

  keysToIncludeInResponse.push(stacksAddressResponse);

  return getAddresses.result.shape.addresses.parse(keysToIncludeInResponse);
}
