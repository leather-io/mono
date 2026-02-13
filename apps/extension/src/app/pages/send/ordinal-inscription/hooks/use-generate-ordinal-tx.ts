import * as btc from '@scure/btc-signer';
import { AddressType, getAddressInfo } from 'bitcoin-address-validation';

import { BitcoinError, determineUtxosForSpend, isP2TROut } from '@leather.io/bitcoin';
import { extractAddressIndexFromPath, extractChangeIndexFromPath } from '@leather.io/crypto';
import type { UtxoWithDerivationPath } from '@leather.io/query';
import { createCounter, createMoney } from '@leather.io/utils';

import { BitcoinInputSigningConfig } from '@shared/crypto/bitcoin/signer-config';
import { logger } from '@shared/logger';
import { OrdinalSendFormValues } from '@shared/models/form.model';

import { useCurrentUtxos } from '@app/query/bitcoin/utxos/utxos.hooks';
import { useBitcoinScureLibNetworkConfig } from '@app/store/accounts/blockchain/bitcoin/bitcoin-keychain';
import { useBitcoinSignerFromInput } from '@app/store/accounts/blockchain/bitcoin/bitcoin-signer';
import { useCurrentAccountNativeSegwitSigner } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentAccountTaprootSigner } from '@app/store/accounts/blockchain/bitcoin/taproot-account.hooks';

import { selectTaprootInscriptionTransferCoins } from '../coinselect/select-inscription-coins';

export function useGenerateUnsignedOrdinalTx(inscriptionInput: UtxoWithDerivationPath) {
  const createTaprootSigner = useCurrentAccountTaprootSigner();
  const createNativeSegwitSigner = useCurrentAccountNativeSegwitSigner();
  const networkMode = useBitcoinScureLibNetworkConfig();
  const { utxos } = useCurrentUtxos();
  const getSignerForInput = useBitcoinSignerFromInput();

  function coverFeeFromAdditionalUtxos(values: OrdinalSendFormValues) {
    if (getAddressInfo(values.inscription.address).type === AddressType.p2wpkh) {
      return formNativeSegwitOrdinalTx(values);
    }

    return formTaprootOrdinalTx(values);
  }

  // TODO: refactor this file to:
  // 1. use useGenerateUnsignedBitcoinTx
  // 2. merge formTaprootOrdinalTx and formNativeSegwitOrdinalTx into one function
  function formTaprootOrdinalTx(values: OrdinalSendFormValues) {
    const taprootSigner = createTaprootSigner?.({
      changeIndex: extractChangeIndexFromPath(inscriptionInput.derivationPath),
      addressIndex: extractAddressIndexFromPath(inscriptionInput.derivationPath),
    });
    const changeSigner = createNativeSegwitSigner?.({ changeIndex: 0, addressIndex: 0 });

    if (!taprootSigner || !changeSigner || !utxos.available || !values.feeRate) return;

    const result = selectTaprootInscriptionTransferCoins({
      recipient: values.recipient,
      inscriptionInput,
      utxos: utxos.available,
      changeAddress: changeSigner.payment.address!,
      feeRate: values.feeRate,
    });

    const psbtInputCounter = createCounter();

    const signingConfig: BitcoinInputSigningConfig[] = [];

    if (!result.success) return null;

    const { inputs, outputs, txFee } = result;

    try {
      const tx = new btc.Transaction();

      // Inscription input
      tx.addInput({
        txid: inscriptionInput.txid,
        index: inscriptionInput.vout,
        tapInternalKey: taprootSigner.payment.tapInternalKey,
        sequence: 0,
        witnessUtxo: {
          script: taprootSigner.payment.script,
          amount: BigInt(inscriptionInput.value),
        },
      });
      signingConfig.push({
        derivationPath: taprootSigner.derivationPath,
        index: psbtInputCounter.getValue(),
      });
      psbtInputCounter.increment();

      // Fee-covering Native Segwit inputs
      inputs.forEach(input => {
        const signer = getSignerForInput(input);
        const tapInternalKey = isP2TROut(signer)
          ? { tapInternalKey: signer.payment.tapInternalKey }
          : {};
        tx.addInput({
          txid: input.txid,
          index: input.vout,
          sequence: 0,
          witnessUtxo: {
            amount: BigInt(input.value),
            script: signer.payment.script,
          },
          ...tapInternalKey,
        });
        signingConfig.push({
          derivationPath: signer.derivationPath,
          index: psbtInputCounter.getValue(),
        });
        psbtInputCounter.increment();
      });

      // Recipient and change outputs
      outputs.forEach(output => tx.addOutputAddress(output.address, output.value, networkMode));

      tx.toPSBT();

      return { psbt: tx.toPSBT(), signingConfig, txFee };
    } catch (e) {
      if (e instanceof BitcoinError && e.message === 'InsufficientFunds') {
        throw e;
      }
      logger.error('Unable to sign transaction', e);
      return null;
    }
  }

  function formNativeSegwitOrdinalTx(values: OrdinalSendFormValues) {
    const changeSigner = createNativeSegwitSigner?.({ changeIndex: 0, addressIndex: 0 });
    const inscriptionSigner = createNativeSegwitSigner?.({
      changeIndex: extractChangeIndexFromPath(inscriptionInput.derivationPath),
      addressIndex: extractAddressIndexFromPath(inscriptionInput.derivationPath),
    });

    const { feeRate, recipient } = values;
    if (!changeSigner || !inscriptionSigner || !utxos || !values.feeRate) return;

    const determineUtxosArgs = {
      feeRate,
      recipients: [{ address: recipient, amount: createMoney(0, 'BTC') }],
      utxos: utxos.available,
    };

    const { inputs, outputs, fee } = determineUtxosForSpend(determineUtxosArgs);

    try {
      const tx = new btc.Transaction();
      const signingConfig: BitcoinInputSigningConfig[] = [];

      tx.addInput({
        txid: inscriptionInput.txid,
        index: inscriptionInput.vout,
        sequence: 0,
        witnessUtxo: {
          amount: BigInt(inscriptionInput.value),
          script: inscriptionSigner.payment.script,
        },
      });
      signingConfig.push({
        index: tx.inputsLength - 1,
        derivationPath: inscriptionSigner.derivationPath,
      });

      // Fee-covering Native Segwit inputs
      inputs.forEach(input => {
        const signer = getSignerForInput(input);
        const tapInternalKey = isP2TROut(signer)
          ? { tapInternalKey: signer.payment.tapInternalKey }
          : {};
        tx.addInput({
          txid: input.txid,
          index: input.vout,
          sequence: 0,
          witnessUtxo: {
            amount: BigInt(input.value),
            script: signer.payment.script,
          },
          ...tapInternalKey,
        });
        signingConfig.push({
          index: tx.inputsLength - 1,
          derivationPath: signer.derivationPath,
        });
      });

      // Inscription output
      tx.addOutputAddress(values.recipient, BigInt(inscriptionInput.value), networkMode);

      // Recipient and change outputs
      outputs.forEach(output => {
        if (Number(output.value) === 0) return;

        if (!output.address) {
          tx.addOutputAddress(changeSigner.address, BigInt(output.value), networkMode);
          return;
        }
        tx.addOutputAddress(values.recipient, BigInt(output.value), networkMode);
      });

      return { psbt: tx.toPSBT(), signingConfig, txFee: fee.amount.toNumber() };
    } catch (e) {
      if (e instanceof BitcoinError && e.message === 'InsufficientFunds') {
        throw e;
      }
      logger.error('Unable to sign transaction', e);
      return null;
    }
  }

  return { coverFeeFromAdditionalUtxos };
}
