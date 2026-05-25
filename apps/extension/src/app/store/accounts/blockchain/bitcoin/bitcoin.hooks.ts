import { useLocation } from 'react-router';

import { bytesToHex } from '@noble/hashes/utils';
import * as btc from '@scure/btc-signer';
import { Psbt } from 'bitcoinjs-lib';
import AppClient from 'ledger-bitcoin';

import {
  type SupportedPaymentType,
  getBitcoinJsLibNetworkConfigByMode,
  getInputPaymentType,
  getTaprootAddress,
  makeNativeSegwitAccountDerivationPath,
  makeTaprootAccountDerivationPath,
} from '@leather.io/bitcoin';
import { extractAddressIndexFromPath, extractChangeIndexFromPath } from '@leather.io/crypto';
import { type AccountId, bitcoinNetworkToNetworkMode } from '@leather.io/models';
import { isNumber, isString, isUndefined } from '@leather.io/utils';

import {
  BitcoinInputSigningConfig,
  getAssumedZeroIndexSigningConfig,
} from '@shared/crypto/bitcoin/signer-config';
import { analytics } from '@shared/utils/analytics';

import { useWalletType } from '@app/common/use-wallet-type';
import { listenForBitcoinTxLedgerSigning } from '@app/features/ledger/flows/bitcoin-tx-signing/bitcoin-tx-signing-event-listeners';
import { useLedgerNavigate } from '@app/features/ledger/hooks/use-ledger-navigate';
import {
  addNativeSegwitSignaturesToPsbt,
  addTaprootInputSignaturesToPsbt,
  createNativeSegwitDefaultWalletPolicy,
  createTaprootDefaultWalletPolicy,
} from '@app/features/ledger/utils/bitcoin-ledger-utils';
import {
  useCurrentAccountTaprootPayer,
  useTaprootAccount,
} from '@app/store/accounts/blockchain/bitcoin/taproot-account.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

import { useCurrentAccountId } from '../../account';
import { useBitcoinSoftwareSignerLookup } from './bitcoin-keychain';
import { allSighashTypes } from './bitcoin-payer';
import {
  useCurrentNativeSegwitAccount,
  useNativeSegwitAccount,
  useUpdateLedgerSpecificNativeSegwitBip32DerivationForAdddressIndexZero,
  useUpdateLedgerSpecificNativeSegwitUtxoHexForAdddressIndexZero,
} from './native-segwit-account.hooks';
import {
  useCurrentTaprootAccount,
  useUpdateLedgerSpecificTaprootInputPropsForAdddressIndexZero,
} from './taproot-account.hooks';

// Checks for both TR and NativeSegwit hooks
export function useHasCurrentBitcoinAccount() {
  const nativeSegwit = useCurrentNativeSegwitAccount();
  const taproot = useCurrentTaprootAccount();
  return !!nativeSegwit && !!taproot;
}

export function useZeroIndexTaprootAddress(accountId?: AccountId) {
  const network = useCurrentNetwork();
  const currentAccount = useCurrentAccountId();
  const account = useTaprootAccount(accountId ?? currentAccount);

  if (!account) throw new Error('Expected keychain to be provided');

  const address = getTaprootAddress({
    addressIndex: 0,
    changeIndex: 0,
    keychain: account.keychain,
    network: bitcoinNetworkToNetworkMode(network.chain.bitcoin.bitcoinNetwork),
  });

  return address;
}

function useSignBitcoinSoftwareTx() {
  const account = useCurrentAccountId();
  const network = useCurrentNetwork();
  const signingCallbacksLookup = useBitcoinSoftwareSignerLookup();

  return (psbt: Uint8Array, inputSigningConfig: BitcoinInputSigningConfig[]) => {
    const tx = btc.Transaction.fromPSBT(psbt);
    const getSigningCallbacks = signingCallbacksLookup(account.fingerprint);

    if (!getSigningCallbacks) throw new Error('Signing callbacks not available');

    inputSigningConfig.forEach(({ index, derivationPath }) => {
      const addressIndex = extractAddressIndexFromPath(derivationPath);
      const changeIndex = extractChangeIndexFromPath(derivationPath);

      const nativeSegwitCallbacks = getSigningCallbacks({
        paymentType: 'p2wpkh',
        network: network.chain.bitcoin.mode,
        accountIndex: account.accountIndex,
        changeIndex,
        addressIndex,
      });

      const taprootCallbacks = getSigningCallbacks({
        paymentType: 'p2tr',
        network: network.chain.bitcoin.mode,
        accountIndex: account.accountIndex,
        changeIndex,
        addressIndex,
      });

      try {
        nativeSegwitCallbacks.signAtIndex(tx, index, allSighashTypes);
      } catch {
        try {
          taprootCallbacks.signAtIndex(tx, index, allSighashTypes);
        } catch {
          // Signing failed, continue without this signature
        }
      }
    });

    return tx;
  };
}

export function useSignLedgerBitcoinTx() {
  const account = useCurrentAccountId();
  const network = useCurrentNetwork();

  const addNativeSegwitUtxoHexLedgerProps =
    useUpdateLedgerSpecificNativeSegwitUtxoHexForAdddressIndexZero();

  const addNativeSegwitBip32Derivation =
    useUpdateLedgerSpecificNativeSegwitBip32DerivationForAdddressIndexZero();

  const updateTaprootLedgerInputs = useUpdateLedgerSpecificTaprootInputPropsForAdddressIndexZero();

  const bitcoinNetworkMode = network.chain.bitcoin.mode;

  return async (
    app: AppClient,
    rawPsbt: Uint8Array,
    signingConfig: BitcoinInputSigningConfig[]
  ) => {
    const fingerprint = await app.getMasterFingerprint();

    // BtcSigner not compatible with Ledger. Encoded format returns more terse
    // version. BitcoinJsLib works.
    const psbt = Psbt.fromBuffer(Buffer.from(rawPsbt), {
      network: getBitcoinJsLibNetworkConfigByMode(bitcoinNetworkMode),
    });

    const btcSignerPsbtClone = btc.Transaction.fromPSBT(psbt.toBuffer());

    const inputByPaymentType = signingConfig.map(config => {
      const inputIndex = btcSignerPsbtClone.getInput(config.index).index;
      if (isUndefined(inputIndex)) throw new Error('Input must have an index for payment type');
      return [
        config,
        getInputPaymentType(btcSignerPsbtClone.getInput(config.index), bitcoinNetworkMode),
      ];
    }) as readonly [BitcoinInputSigningConfig, SupportedPaymentType][];

    //
    // Taproot
    const taprootInputsToSign = inputByPaymentType
      .filter(([_, paymentType]) => paymentType === 'p2tr')
      .map(([index]) => index);

    if (taprootInputsToSign.length) {
      updateTaprootLedgerInputs(psbt, fingerprint, taprootInputsToSign);

      const taprootExtendedPublicKey = await app.getExtendedPubkey(
        makeTaprootAccountDerivationPath(bitcoinNetworkMode, account.accountIndex)
      );

      const taprootPolicy = createTaprootDefaultWalletPolicy({
        fingerprint,
        accountIndex: account.accountIndex,
        network: bitcoinNetworkMode,
        xpub: taprootExtendedPublicKey,
      });

      const taprootSignatures = await app.signPsbt(psbt.toBase64(), taprootPolicy, null);

      addTaprootInputSignaturesToPsbt(psbt, taprootSignatures);
    }

    //
    // Native Segwit
    const nativeSegwitInputsToSign = inputByPaymentType
      .filter(([_, paymentType]) => paymentType === 'p2wpkh')
      .map(([index]) => index);

    if (nativeSegwitInputsToSign.length) {
      const nativeSegwitExtendedPublicKey = await app.getExtendedPubkey(
        makeNativeSegwitAccountDerivationPath(bitcoinNetworkMode, account.accountIndex)
      );

      // Without adding the full non-witness data, the Ledger will present a
      // warning. In some cases, e.g. bip322, the original witness data doesn't
      // exist, and we want the user to proceed, despite the warning.
      try {
        await addNativeSegwitUtxoHexLedgerProps(psbt, nativeSegwitInputsToSign);
        analytics.track('native_segwit_tx_hex_to_ledger_tx', { success: true });
      } catch {
        analytics.track('native_segwit_tx_hex_to_ledger_tx', { success: false });
      }

      addNativeSegwitBip32Derivation(psbt, fingerprint, nativeSegwitInputsToSign);

      const nativeSegwitPolicy = createNativeSegwitDefaultWalletPolicy({
        fingerprint,
        accountIndex: account.accountIndex,
        network: bitcoinNetworkMode,
        xpub: nativeSegwitExtendedPublicKey,
      });

      const nativeSegwitSignatures = await app.signPsbt(psbt.toBase64(), nativeSegwitPolicy, null);

      addNativeSegwitSignaturesToPsbt(psbt, nativeSegwitSignatures);
    }

    // Turn back into BtcSigner lib format
    // REMINDER: this tx is not finalized
    return btc.Transaction.fromPSBT(psbt.toBuffer());
  };
}

export function useAddTapInternalKeysIfMissing() {
  const createTaprootSigner = useCurrentAccountTaprootPayer();

  return (tx: btc.Transaction, inputIndexes: BitcoinInputSigningConfig[]) =>
    inputIndexes.forEach(({ index, derivationPath }) => {
      const taprootSigner = createTaprootSigner?.({
        addressIndex: extractAddressIndexFromPath(derivationPath),
        changeIndex: extractChangeIndexFromPath(derivationPath),
      });
      if (!taprootSigner) throw new Error('Taproot signer not found');
      const input = tx.getInput(index);

      const witnessOutputScript =
        input.witnessUtxo?.script && btc.OutScript.decode(input.witnessUtxo.script);

      // Original implementation supports auto-adding of tapInternalKey if
      // missing. This functionality helps some developers who don't form their
      // tx correctly, however neglects certain alternate use cases, e.g. script
      // spends. We should consider removing this functionality in the future.
      function shouldAssumeTxNeedsTaprootInternalKeyAdded() {
        if (!taprootSigner) return false;
        if (witnessOutputScript?.type !== 'tr') return false;
        // Already has it, doesn't need
        if (input.tapInternalKey) return false;
        // Is a script spend, doesn't need `tapInternalKey`
        if (input.tapLeafScript) return false;
        return true;
      }

      if (shouldAssumeTxNeedsTaprootInternalKeyAdded()) {
        analytics.track('psbt_sign_request_p2tr_missing_taproot_internal_key');
        tx.updateInput(index, { ...input, tapInternalKey: taprootSigner.payment.tapInternalKey });
      }
    });
}

export function useGetAssumedZeroIndexSigningConfig() {
  const network = useCurrentNetwork();
  const account = useCurrentAccountId();

  return (psbt: Uint8Array, indexesToSign?: number[]) =>
    getAssumedZeroIndexSigningConfig({
      psbt,
      network: bitcoinNetworkToNetworkMode(network.chain.bitcoin.bitcoinNetwork),
      indexesToSign,
    }).forAccountIndex(account.accountIndex);
}

export function useSignBitcoinTx() {
  const { whenWallet } = useWalletType();
  const ledgerNavigate = useLedgerNavigate();
  const location = useLocation();
  const signSoftwareTx = useSignBitcoinSoftwareTx();
  const getDefaultSigningConfig = useGetAssumedZeroIndexSigningConfig();

  /**
   * Bitcoin signing function. Don't forget to finalize the tx once it's
   * returned. You can broadcast with the hex value from `tx.hex`.
   */
  return (psbt: Uint8Array, inputsToSign?: BitcoinInputSigningConfig[] | number[]) => {
    function getSigningConfig(inputsToSign?: BitcoinInputSigningConfig[] | number[]) {
      if (!inputsToSign) return getDefaultSigningConfig(psbt);
      if (inputsToSign.every(isNumber)) return getDefaultSigningConfig(psbt, inputsToSign);
      return inputsToSign;
    }

    return whenWallet({
      async ledger() {
        // Because Ledger signing is a multi-step process that takes place over
        // many routes, in order to achieve a consistent API between
        // Ledger/software, we subscribe to the event that occurs when the
        // unsigned tx is signed
        void ledgerNavigate.toConnectAndSignBitcoinTransactionStep(
          psbt,
          getSigningConfig(inputsToSign),
          location
        );
        return listenForBitcoinTxLedgerSigning(bytesToHex(psbt));
      },
      software() {
        return signSoftwareTx(psbt, getSigningConfig(inputsToSign));
      },
    })();
  };
}

function useBitcoinAccountNativeSegwitXpub(accountId: AccountId) {
  const nativeSegwitAccount = useNativeSegwitAccount(accountId);
  if (!nativeSegwitAccount) return null;
  return `wpkh(${nativeSegwitAccount?.keychain.publicExtendedKey})`;
}

function useBitcoinAccountTaprootXpub(accountId: AccountId) {
  const taprootAccount = useTaprootAccount(accountId);
  if (!taprootAccount) return null;
  return `tr(${taprootAccount?.keychain.publicExtendedKey})`;
}

export function useBitcoinAccountXpubs(accountId: AccountId) {
  const nativeSegwitXpub = useBitcoinAccountNativeSegwitXpub(accountId);
  const taprootXpub = useBitcoinAccountTaprootXpub(accountId);
  return [nativeSegwitXpub, taprootXpub].filter(xpub => isString(xpub));
}
