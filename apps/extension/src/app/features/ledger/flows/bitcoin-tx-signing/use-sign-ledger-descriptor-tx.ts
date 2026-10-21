import * as btc from '@scure/btc-signer';
import { Psbt } from 'bitcoinjs-lib';

import {
  compileWshDescriptor,
  findAccountDescriptorKey,
  getBitcoinJsLibNetworkConfigByMode,
  toWalletPolicyDescriptor,
} from '@leather.io/bitcoin';
import type { HardwareBitcoinSigner, OperationContext } from '@leather.io/ledger';

import { type BitcoinInputSigningConfig } from '@shared/crypto/bitcoin/signer-config';
import { logger } from '@shared/logger';

import { useLedgerSteps } from '@app/features/ledger/flow/ledger-flow.context';
import { withInteractionHandler } from '@app/features/ledger/hardware-wallet/operation-context.utils';
import { registerLedgerWalletPolicyPrompt } from '@app/features/ledger/utils/generic-ledger-utils';
import {
  useCurrentNativeSegwitAccount,
  useUpdateLedgerSpecificNativeSegwitUtxoHexForAdddressIndexZero,
} from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useHardwareBitcoinInputsToSign } from '@app/store/accounts/blockchain/bitcoin/use-hardware-bitcoin-inputs-to-sign';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

// Signs the PSBT input(s) controlled by a `wsh(...)` miniscript descriptor with a
// Ledger device. Ledger can only sign such inputs through a registered
// (non-standard) wallet policy, so per request we register a fresh policy (no
// HMAC is persisted — `ledgerState` is created here and discarded) and then sign.
// `@bitcoinerlab/descriptors` converts the descriptor into the Ledger
// template/keyRoots, registers it, and merges the device's partial signatures
// back into the PSBT.
export function useSignLedgerDescriptorTx() {
  const network = useCurrentNetwork();
  const nativeSegwitAccount = useCurrentNativeSegwitAccount();
  const ledgerNavigate = useLedgerSteps();
  const addNonWitnessUtxo = useUpdateLedgerSpecificNativeSegwitUtxoHexForAdddressIndexZero();
  const toHardwareInputsToSign = useHardwareBitcoinInputsToSign();
  const bitcoinNetworkMode = network.chain.bitcoin.mode;

  return async (
    signer: HardwareBitcoinSigner,
    rawPsbt: Uint8Array,
    descriptor: string,
    signingConfig: BitcoinInputSigningConfig[],
    ctx: OperationContext
  ) => {
    if (!nativeSegwitAccount) throw new Error('No native segwit account available');

    // Ledger can only sign through a wallet policy keyed by `[fingerprint/path]xpub`,
    // so rewrite the account's key (a bare xpub or a raw 0/0 pubkey) into that form.
    const compiled = compileWshDescriptor(descriptor);
    const accountDescriptorKey = findAccountDescriptorKey(compiled, nativeSegwitAccount.keychain);
    if (!accountDescriptorKey) throw new Error('Current account is not part of this descriptor');

    const policyDescriptor = toWalletPolicyDescriptor(
      descriptor,
      accountDescriptorKey.key,
      nativeSegwitAccount.xpub,
      nativeSegwitAccount.keyOrigin
    );

    const psbt = Psbt.fromBuffer(Buffer.from(rawPsbt), {
      network: getBitcoinJsLibNetworkConfigByMode(bitcoinNetworkMode),
    });

    // Ledger needs the full previous transaction to verify each segwit input's
    // amount; without it the device signs but warns "Unverified inputs". Adding
    // it is best-effort — signing still succeeds (with the warning) if it fails.
    try {
      await addNonWitnessUtxo(psbt, signingConfig);
    } catch {
      logger.warn(
        'Failed to add non-witness UTXO; Ledger will sign with unverified inputs warning'
      );
    }

    const signedPsbt = await signer.signPsbt(
      {
        psbt: new Uint8Array(psbt.toBuffer()),
        network: bitcoinNetworkMode,
        inputsToSign: toHardwareInputsToSign(signingConfig),
        policyDescriptor,
      },
      withInteractionHandler(ctx, interaction => {
        if (interaction.type === 'approve-policy')
          ledgerNavigate.toDeviceBusyStep(registerLedgerWalletPolicyPrompt);
        if (interaction.type === 'confirm-on-device')
          ledgerNavigate.toAwaitingDeviceOperation({ hasApprovedOperation: false });
      })
    );

    return btc.Transaction.fromPSBT(signedPsbt);
  };
}
