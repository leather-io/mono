import {
  compileWshDescriptor,
  findAccountDescriptorKey,
  toWalletPolicyDescriptor,
} from '@leather.io/bitcoin';
import {
  type HardwareBitcoinSigner,
  type OperationContext,
  descriptorHasNonAccountRawKey,
} from '@leather.io/ledger';

import { useCurrentNativeSegwitAccount } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

import { useLedgerSteps } from '../flow/ledger-flow.context';
import { withInteractionHandler } from '../hardware-wallet/operation-context.utils';
import { registerLedgerWalletPolicyPrompt } from '../utils/generic-ledger-utils';

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
  const ledgerNavigate = useLedgerSteps();

  return async (
    signer: HardwareBitcoinSigner,
    descriptor: string,
    ctx: OperationContext
  ): Promise<string> => {
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

    const policyDescriptor = toWalletPolicyDescriptor(
      descriptor,
      accountDescriptorKey.key,
      nativeSegwitAccount.xpub,
      nativeSegwitAccount.keyOrigin
    );

    return signer.showAddress(
      {
        kind: 'policy',
        policyDescriptor,
        changeIndex: compiled.keyPathIndexes.changeIndex,
        addressIndex: compiled.keyPathIndexes.addressIndex,
      },
      withInteractionHandler(ctx, interaction => {
        if (interaction.type !== 'approve-policy') return;
        ledgerNavigate.toDeviceBusyStep(registerLedgerWalletPolicyPrompt);
      })
    );
  };
}
