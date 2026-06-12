import { type LedgerState, ledger, signers } from '@bitcoinerlab/descriptors';
import * as btc from '@scure/btc-signer';
import { Psbt } from 'bitcoinjs-lib';
import AppClient from 'ledger-bitcoin';

import {
  compileWshDescriptor,
  deriveAddressIndexKeychainFromAccount,
  findAccountKeyByPubkey,
  getBitcoinJsLibNetworkConfigByMode,
  makeWshDescriptorInstance,
  toLedgerSignableDescriptor,
} from '@leather.io/bitcoin';

import { BitcoinInputSigningConfig } from '@shared/crypto/bitcoin/signer-config';
import { logger } from '@shared/logger';

import {
  useCurrentNativeSegwitAccount,
  useUpdateLedgerSpecificNativeSegwitBip32DerivationForAdddressIndexZero,
  useUpdateLedgerSpecificNativeSegwitUtxoHexForAdddressIndexZero,
} from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
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
  const addNativeSegwitBip32Derivation =
    useUpdateLedgerSpecificNativeSegwitBip32DerivationForAdddressIndexZero();
  const addNonWitnessUtxo = useUpdateLedgerSpecificNativeSegwitUtxoHexForAdddressIndexZero();
  const bitcoinNetworkMode = network.chain.bitcoin.mode;

  return async (
    app: AppClient,
    rawPsbt: Uint8Array,
    descriptor: string,
    signingConfig: BitcoinInputSigningConfig[]
  ) => {
    if (!nativeSegwitAccount) throw new Error('No native segwit account available');

    const addressIndexKeychain = deriveAddressIndexKeychainFromAccount(
      nativeSegwitAccount.keychain
    )({
      changeIndex: 0,
      addressIndex: 0,
    });
    if (!addressIndexKeychain.publicKey) throw new Error('Unable to derive public key for signing');

    // Ledger can only sign through a wallet policy keyed by `[fingerprint/path]xpub`,
    // so rewrite the account's key (a bare xpub or a raw 0/0 pubkey) into that form.
    const { keys } = compileWshDescriptor(descriptor);
    const accountKey = findAccountKeyByPubkey(keys, addressIndexKeychain.publicKey);
    if (!accountKey)
      throw new Error('Current account (at address index 0) is not part of this descriptor');

    const ledgerDescriptor = toLedgerSignableDescriptor(
      descriptor,
      accountKey,
      nativeSegwitAccount.xpub,
      nativeSegwitAccount.keyOrigin
    );
    const descriptorInstance = makeWshDescriptorInstance(ledgerDescriptor);

    const fingerprint = await app.getMasterFingerprint();
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
    addNativeSegwitBip32Derivation(psbt, fingerprint, signingConfig);

    // A coordinator PSBT may already carry a partialSig for the account key; the
    // device adding its own would collide on bip174's by-pubkey dedupe. Strip ours
    // (co-signer signatures stay) so signLedger can merge the fresh signature.
    const accountPubkey = Buffer.from(addressIndexKeychain.publicKey);
    signingConfig.forEach(({ index }) => {
      const input = psbt.data.inputs[index];
      if (!input?.partialSig?.length) return;
      const remaining = input.partialSig.filter(sig => !sig.pubkey.equals(accountPubkey));
      if (remaining.length === input.partialSig.length) return;
      if (remaining.length) input.partialSig = remaining;
      else delete input.partialSig;
    });

    const ledgerState: LedgerState = {};
    await ledger.registerLedgerWallet({
      descriptor: descriptorInstance,
      ledgerClient: app,
      ledgerState,
      policyName: 'Leather',
    });
    await signers.signLedger({
      psbt,
      descriptors: [descriptorInstance],
      ledgerClient: app,
      ledgerState,
    });

    return btc.Transaction.fromPSBT(psbt.toBuffer());
  };
}
