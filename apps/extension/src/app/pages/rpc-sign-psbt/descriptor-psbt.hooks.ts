import { useLocation } from 'react-router';

import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import * as btc from '@scure/btc-signer';

import {
  type LedgerDescriptorResolutionError,
  compileWshDescriptor,
  findAccountDescriptorKey,
  getDescriptorMatchingInputIndexes,
  isExtendedPublicKeyExpression,
  makeNativeSegwitAddressIndexDerivationPath,
  resolveLedgerSignableDescriptor,
} from '@leather.io/bitcoin';

import { useWalletType } from '@app/common/use-wallet-type';
import { listenForBitcoinTxLedgerSigning } from '@app/features/ledger/flows/bitcoin-tx-signing/bitcoin-tx-signing-event-listeners';
import { useLedgerNavigate } from '@app/features/ledger/hooks/use-ledger-navigate';
import { usePsbtSigner } from '@app/features/psbt-signer/hooks/use-psbt-signer';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

import { useCurrentAccountId } from '../../store/accounts/account';
import { useCurrentNativeSegwitAccount } from '../../store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

function getLedgerDescriptorResolutionErrorMessage({
  publicKey,
  reason,
}: LedgerDescriptorResolutionError) {
  return `Ledger cannot sign this descriptor: raw public key ${publicKey} could not be verified from PSBT_GLOBAL_XPUB and PSBT_IN_BIP32_DERIVATION (${reason.replaceAll('-', ' ')}).`;
}

// Prepares a PSBT for signing against a `wsh(...)` miniscript descriptor. The
// descriptor is the source of truth: we compile it to a witness script and
// scriptPubKey, confirm the current account's native segwit xpub is one of its
// keys, attach the witness script to every input the descriptor locks, and build
// a signing config targeting those inputs at address index 0. The plan is
// wallet-agnostic — software signs it directly, Ledger signs it on-device.
function useGetDescriptorSigningPlan() {
  const network = useCurrentNetwork();
  const accountId = useCurrentAccountId();
  const nativeSegwitAccount = useCurrentNativeSegwitAccount();

  return (psbtHex: string, descriptor: string) => {
    if (!nativeSegwitAccount) throw new Error('No native segwit account available');

    const compiled = compileWshDescriptor(descriptor);
    const { scriptPubKey, witnessScript } = compiled;

    const accountDescriptorKey = findAccountDescriptorKey(compiled, nativeSegwitAccount.keychain);
    if (!accountDescriptorKey) throw new Error('Current account is not part of this descriptor');

    const tx = btc.Transaction.fromPSBT(hexToBytes(psbtHex));
    const inputIndexes = getDescriptorMatchingInputIndexes(tx, scriptPubKey);
    if (!inputIndexes.length) throw new Error('No PSBT input is locked by the provided descriptor');

    const derivationPath = makeNativeSegwitAddressIndexDerivationPath({
      network: network.chain.bitcoin.mode,
      accountIndex: accountId.accountIndex,
      changeIndex: accountDescriptorKey.changeIndex,
      addressIndex: accountDescriptorKey.addressIndex,
    });

    inputIndexes.forEach(index => tx.updateInput(index, { witnessScript }));
    const signingConfig = inputIndexes.map(index => ({ index, derivationPath }));

    return { tx, signingConfig, inputIndexes, accountKey: accountDescriptorKey.key };
  };
}

// Signs a descriptor-locked PSBT with the current account, dispatching on wallet
// type: software signs through the shared `signPsbt` pipeline, Ledger routes
// through the multi-step device flow (the descriptor is threaded via nav state).
// The shared signer skips inputs it can't sign, so we treat any matched input
// left unsigned as a hard error rather than returning a falsely-signed PSBT.
export function useSignDescriptorPsbt() {
  const getDescriptorSigningPlan = useGetDescriptorSigningPlan();
  const { signPsbt } = usePsbtSigner();
  const { whenWallet } = useWalletType();
  const ledgerNavigate = useLedgerNavigate();
  const location = useLocation();

  return async (psbtHex: string, descriptor: string) => {
    const { tx, signingConfig, inputIndexes, accountKey } = getDescriptorSigningPlan(
      psbtHex,
      descriptor
    );

    const signedTx = await whenWallet({
      software: () => signPsbt({ tx, signingConfig }),
      ledger() {
        const resolution = resolveLedgerSignableDescriptor({
          descriptor,
          psbt: tx.toPSBT(),
          inputIndexes,
          accountKey,
        });
        if (resolution.status === 'error')
          throw new Error(getLedgerDescriptorResolutionErrorMessage(resolution));

        const ledgerDescriptor = resolution.descriptor;
        const { keys } = compileWshDescriptor(ledgerDescriptor);

        // Ledger can only register a wallet policy whose keys are extended keys
        // (`[fingerprint/path]xpub`). We convert the account's key, but a co-signer
        // supplied as a raw public key has no xpub/origin and cannot be expressed
        // in a Ledger policy — fail fast with a clear message instead of a masked
        // on-device rejection.
        if (
          keys.some(
            key =>
              key.keyExpression !== accountKey.keyExpression &&
              !isExtendedPublicKeyExpression(key.keyExpression)
          )
        )
          throw new Error(
            'Ledger cannot sign this descriptor: another signer is a raw public key. Ledger requires every key to be an extended public key (xpub). Sign this contract with a software wallet instead.'
          );

        void ledgerNavigate.toConnectAndSignBitcoinTransactionStep(
          tx.toPSBT(),
          signingConfig,
          location,
          ledgerDescriptor
        );
        return listenForBitcoinTxLedgerSigning(bytesToHex(tx.toPSBT()));
      },
    })();

    const accountPubkeyHex = bytesToHex(accountKey.pubkey);
    function isInputMissingUserSig(index: number) {
      return !signedTx
        .getInput(index)
        .partialSig?.some(([pubkey]) => bytesToHex(pubkey) === accountPubkeyHex);
    }
    if (inputIndexes.some(isInputMissingUserSig))
      throw new Error('Failed to add signature to descriptor input');

    return signedTx;
  };
}
