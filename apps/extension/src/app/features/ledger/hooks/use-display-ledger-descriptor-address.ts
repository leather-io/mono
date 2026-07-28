import { type LedgerState, ledger } from '@bitcoinerlab/descriptors';
import AppClient, { WalletPolicy } from 'ledger-bitcoin';

import {
  compileWshDescriptor,
  findAccountDescriptorKey,
  makeWshDescriptorInstance,
  toLedgerSignableDescriptor,
} from '@leather.io/bitcoin';

import { useCurrentNativeSegwitAccount } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

import { descriptorHasNonAccountRawKey } from '../utils/ledger-descriptor-address';

// Displays the `wsh(...)` multisig address on the Ledger screen so the user can
// confirm it against the extension. Ledger can only show a non-standard
// (multisig) address through a registered wallet policy, so per request we
// register a fresh policy (no HMAC is persisted — `ledgerState` is created here
// and discarded), read the policy/HMAC back, then ask the device to display the
// address at the descriptor's own key-path index (so it equals the locally
// derived address). Returns the address the device showed for the caller to
// assert against the locally derived one.
export function useDisplayLedgerDescriptorAddress() {
  const nativeSegwitAccount = useCurrentNativeSegwitAccount();

  return async (app: AppClient, descriptor: string): Promise<string> => {
    if (!nativeSegwitAccount) throw new Error('No native segwit account available');

    const compiled = compileWshDescriptor(descriptor);
    const accountDescriptorKey = findAccountDescriptorKey(compiled, nativeSegwitAccount.keychain);
    if (!accountDescriptorKey) throw new Error('Current account is not part of this descriptor');

    // Ledger can only register a wallet policy whose keys are extended keys
    // (`[fingerprint/path]xpub`). A co-signer supplied as a raw public key has no
    // xpub/origin and cannot be expressed in a Ledger policy — fail fast with a
    // clear message instead of a masked on-device rejection.
    if (descriptorHasNonAccountRawKey(compiled, accountDescriptorKey.key))
      throw new Error(
        'Ledger cannot display this address: another signer is a raw public key. Ledger requires every key to be an extended public key (xpub).'
      );

    const ledgerDescriptor = toLedgerSignableDescriptor(
      descriptor,
      accountDescriptorKey.key,
      nativeSegwitAccount.xpub,
      nativeSegwitAccount.keyOrigin
    );
    const descriptorInstance = makeWshDescriptorInstance(ledgerDescriptor);

    // Registering the (non-standard) multisig policy stores its template,
    // keyRoots and HMAC on `ledgerState.policies`. We register exactly one policy
    // into a fresh state, so the registered policy is the only entry; the HMAC is
    // not persisted (the state is discarded with this call).
    const ledgerState: LedgerState = {};
    await ledger.registerLedgerWallet({
      descriptor: descriptorInstance,
      ledgerClient: app,
      ledgerState,
      policyName: 'Leather',
    });

    const policy = ledgerState.policies?.[0];
    if (!policy) throw new Error('Could not resolve the Ledger wallet policy for this descriptor');

    const walletPolicy = new WalletPolicy(
      policy.policyName ?? 'Leather',
      policy.ledgerTemplate,
      policy.keyRoots
    );

    const { changeIndex, addressIndex } = compiled.keyPathIndexes;
    return app.getWalletAddress(
      walletPolicy,
      policy.policyHmac ?? null,
      changeIndex,
      addressIndex,
      true
    );
  };
}
