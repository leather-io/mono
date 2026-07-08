import {
  AddressHashMode,
  AddressVersion,
  addressFromPublicKeys,
  addressToString,
  createStacksPublicKey,
} from '@stacks/transactions';

import {
  compileWshDescriptor,
  getAddressFromOutScript,
  getBtcSignerLibNetworkConfigByMode,
} from '@leather.io/bitcoin';
import type { VaultAccount } from '@leather.io/models';

import { resolveBtcNetworkMode } from '../network/resolve-btc-network-mode';
import { getMultisigDescriptor } from './btc-multisig-descriptor';

// Signing pubkeys in signerIndex order — the canonical ordering the multisig
// address (and the STX permutation) is derived from.
export function getOrderedSigningPubkeys(account: VaultAccount): string[] {
  return [...account.signers]
    .sort((a, b) => a.signerIndex - b.signerIndex)
    .map(signer => signer.signingPubkey);
}

function deriveBtcMultisigAddress(account: VaultAccount): string {
  const { scriptPubKey } = compileWshDescriptor(getMultisigDescriptor(account));
  const network = getBtcSignerLibNetworkConfigByMode(resolveBtcNetworkMode(account.network));
  const address = getAddressFromOutScript(scriptPubKey, network);
  if (!address) throw new Error('Could not derive BTC multisig address from descriptor');
  return address;
}

function deriveStxMultisigAddress(account: VaultAccount): string {
  const version =
    account.network === 'stx:mainnet'
      ? AddressVersion.MainnetMultiSig
      : AddressVersion.TestnetMultiSig;
  return addressToString(
    addressFromPublicKeys(
      version,
      AddressHashMode.P2SHNonSequential,
      account.threshold,
      getOrderedSigningPubkeys(account).map(createStacksPublicKey)
    )
  );
}

// Re-derives a vault account's multisig address from its signer set + threshold
export function deriveMultisigAddress(account: VaultAccount): string {
  return account.network.startsWith('btc')
    ? deriveBtcMultisigAddress(account)
    : deriveStxMultisigAddress(account);
}
