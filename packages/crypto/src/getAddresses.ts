import { BtcAddress } from '@btckit/types';
import { BitcoinAccount, ecdsaPublicKeyToSchnorr } from '@leather-wallet/bitcoin/src/bitcoin.utils';
import { NetworkConfiguration } from '@leather-wallet/constants';
import { bytesToHex } from '@stacks/common';
import { TransactionPayload } from '@stacks/connect';

import { useCurrentAccountNativeSegwitIndexZeroSigner } from './utils/bitcoin/native-segwit-account.hooks';
import { useCurrentAccountTaprootIndexZeroSigner } from './utils/bitcoin/taproot-account.hooks';
import { useCurrentStacksAccount } from './utils/stacks/stacks-account';
import { StacksAccount } from './utils/stacks/stacks-account.models';
import { KeyConfig } from './utils/useWalletType';

export function useGetAddresses({
  signatureIndex,
  currentAccountIndex,
  currentNetwork,
  hasLedgerKeys,
  hasSwitchedAccounts,
  segwitAccount,
  stacksAccounts,
  taprootAccount,
  transactionPayload,
  wallet,
}: {
  signatureIndex: number | undefined;
  currentAccountIndex: number;
  currentNetwork: NetworkConfiguration;
  hasLedgerKeys: boolean;
  hasSwitchedAccounts: boolean;
  segwitAccount: BitcoinAccount | undefined;
  stacksAccounts: StacksAccount[];
  taprootAccount: BitcoinAccount | undefined;
  transactionPayload: TransactionPayload | null;
  wallet: KeyConfig | undefined;
}) {
  const nativeSegwitSigner = useCurrentAccountNativeSegwitIndexZeroSigner({
    currentAccountIndex,
    segwitAccount,
    currentNetwork,
    hasLedgerKeys,
    wallet,
  });
  const taprootSigner = useCurrentAccountTaprootIndexZeroSigner({
    currentAccountIndex,
    taprootAccount,
    currentNetwork,
    hasLedgerKeys,
    wallet,
  });
  const stacksAccount = useCurrentStacksAccount({
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
