import { BtcAddress } from '@btckit/types';
import { BitcoinAccount, ecdsaPublicKeyToSchnorr } from '@leather-wallet/bitcoin/src/bitcoin.utils';
import { NetworkConfiguration } from '@leather-wallet/constants';
import { Versions } from '@scure/bip32';
import { bytesToHex } from '@stacks/common';
import { TransactionPayload } from '@stacks/connect';

import { getCurrentAccountNativeSegwitIndexZeroSigner } from './utils/bitcoin/native-segwit-account.hooks';
import { getCurrentAccountTaprootIndexZeroSigner } from './utils/bitcoin/taproot-account.hooks';
import { getCurrentStacksAccount } from './utils/stacks/stacks-account';
import { StacksAccount } from './utils/stacks/stacks-account.models';

export function getAddresses({
  signatureIndex,
  currentAccountIndex,
  currentNetwork,
  hasSwitchedAccounts,
  nativeSegwitAccount,
  stacksAccounts,
  taprootAccount,
  transactionPayload,
  bitcoinExtendedPublicKeyVersions,
}: {
  signatureIndex: number | undefined;
  currentAccountIndex: number;
  currentNetwork: NetworkConfiguration;
  hasSwitchedAccounts: boolean;
  nativeSegwitAccount: BitcoinAccount | undefined;
  stacksAccounts: StacksAccount[];
  taprootAccount: BitcoinAccount | undefined;
  transactionPayload: TransactionPayload | null;
  bitcoinExtendedPublicKeyVersions: Versions | undefined;
}) {
  const nativeSegwitSigner = getCurrentAccountNativeSegwitIndexZeroSigner({
    currentAccountIndex,
    nativeSegwitAccount,
    bitcoinExtendedPublicKeyVersions,
  });
  const taprootSigner = getCurrentAccountTaprootIndexZeroSigner({
    currentAccountIndex,
    taprootAccount,
    currentNetwork,
    bitcoinExtendedPublicKeyVersions,
  });
  const stacksAccount = getCurrentStacksAccount({
    currentAccountIndex,
    stacksAccounts,
    transactionPayload,
    hasSwitchedAccounts,
    signatureIndex,
  });

  const taprootAddressResponse: BtcAddress = {
    symbol: 'BTC',
    type: 'p2tr',
    address: taprootSigner.address,
    publicKey: bytesToHex(taprootSigner.publicKey),
    tweakedPublicKey: bytesToHex(ecdsaPublicKeyToSchnorr(taprootSigner.publicKey)),
    derivationPath: taprootSigner.derivationPath,
  };

  const nativeSegwitAddressResponse: BtcAddress = {
    symbol: 'BTC',
    type: 'p2wpkh',
    address: nativeSegwitSigner.address,
    publicKey: bytesToHex(nativeSegwitSigner.publicKey),
    derivationPath: nativeSegwitSigner.derivationPath,
  };

  const stacksAddressResponse = {
    symbol: 'STX',
    address: stacksAccount?.address ?? '',
  };

  return {
    stacksAddressResponse,
    nativeSegwitAddressResponse,
    taprootAddressResponse,
  };
}
