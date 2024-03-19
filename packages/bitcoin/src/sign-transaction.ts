import { NetworkConfiguration } from '@leather-wallet/constants';
import { WalletType, whenWallet } from '@leather-wallet/crypto';
import { isNumber } from '@leather-wallet/utils';
import * as btc from '@scure/btc-signer';

// import { bytesToHex } from '@stacks/common';
import { Signer, allSighashTypes, extractAddressIndexFromPath } from '..';
import { BitcoinInputSigningConfig, getAssumedZeroIndexSigningConfig } from './signer-config';

async function signBitcoinSoftwareTx({
  createNativeSegwitSigner,
  createTaprootSigner,
  psbt,
  inputSigningConfig,
}: {
  createNativeSegwitSigner: (addressIndex: number) => Signer<btc.P2Ret>;
  createTaprootSigner: (addressIndex: number) => Signer<btc.P2TROut>;
  psbt: Uint8Array;
  inputSigningConfig: BitcoinInputSigningConfig[];
}) {
  const tx = btc.Transaction.fromPSBT(psbt);

  inputSigningConfig.forEach(({ index, derivationPath }) => {
    const nativeSegwitSigner = createNativeSegwitSigner?.(
      extractAddressIndexFromPath(derivationPath)
    );
    const taprootSigner = createTaprootSigner?.(extractAddressIndexFromPath(derivationPath));

    if (!nativeSegwitSigner || !taprootSigner) throw new Error('Signers not available');

    // See #4628.
    // Our API doesn't support users specifying which key they want to sign
    // with. Until we support this, we sign with both, as in some cases, e.g.
    // Asigna, the Native Segwit key is used to sign a multisig taproot input
    try {
      nativeSegwitSigner.signIndex(tx, index, allSighashTypes);
    } catch (e) {
      try {
        taprootSigner.signIndex(tx, index, allSighashTypes);
      } catch (er) {}
    }
  });

  return tx;
}

export function signBitcoinTx({
  walletType,
  onLedgerSignSuccess,
  createNativeSegwitSigner,
  createTaprootSigner,
  network,
  accountIndex,
}: {
  walletType: WalletType;
  onLedgerSignSuccess?: () => void;
  createNativeSegwitSigner: (addressIndex: number) => Signer<btc.P2Ret>;
  createTaprootSigner: (addressIndex: number) => Signer<btc.P2TROut>;
  network: NetworkConfiguration;
  accountIndex: number;
}) {
  const getDefaultSigningConfig = function (psbt: Uint8Array, indexesToSign?: number[]) {
    return getAssumedZeroIndexSigningConfig({
      psbt,
      network: network.chain.bitcoin.bitcoinNetwork,
      indexesToSign,
    }).forAccountIndex(accountIndex);
  };

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

    return whenWallet(walletType)({
      async ledger() {
        // Because Ledger signing is a multi-step process that takes place over
        // many routes, in order to achieve a consistent API between
        // Ledger/software, we subscribe to the event that occurs when the
        // unsigned tx is signed
        return onLedgerSignSuccess?.();
        // ledgerNavigate.toConnectAndSignBitcoinTransactionStep(psbt, getSigningConfig(inputsToSign));
        // return listenForBitcoinTxLedgerSigning(bytesToHex(psbt));
      },
      async software() {
        return await signBitcoinSoftwareTx({
          createNativeSegwitSigner,
          createTaprootSigner,
          psbt,
          inputSigningConfig: getSigningConfig(inputsToSign),
        });
      },
    })();
  };
}
