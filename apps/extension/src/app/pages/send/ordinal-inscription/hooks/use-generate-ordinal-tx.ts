import * as btc from '@scure/btc-signer';
import { AddressType, getAddressInfo } from 'bitcoin-address-validation';

import { BitcoinError, determineUtxosForSpend } from '@leather.io/bitcoin';
import {
  extractAddressIndexFromPath,
  extractChangeIndexFromPath,
  keyOriginToDerivationPath,
} from '@leather.io/crypto';
import type { UtxoWithDerivationPath } from '@leather.io/query';
import { createCounter, createMoney } from '@leather.io/utils';

import { BitcoinInputSigningConfig } from '@shared/crypto/bitcoin/signer-config';
import { logger } from '@shared/logger';
import { OrdinalSendFormValues } from '@shared/models/form.model';

import { useCurrentNativeSegwitUtxos } from '@app/query/bitcoin/utxos/utxos.hooks';
import { useBitcoinScureLibNetworkConfig } from '@app/store/accounts/blockchain/bitcoin/bitcoin-keychain';
import { useBitcoinPayerFromInput } from '@app/store/accounts/blockchain/bitcoin/bitcoin-payer';
import { useCurrentAccountNativeSegwitPayer } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentAccountTaprootPayer } from '@app/store/accounts/blockchain/bitcoin/taproot-account.hooks';

import { selectTaprootInscriptionTransferCoins } from '../coinselect/select-inscription-coins';

export function useGenerateUnsignedOrdinalTx(inscriptionInput: UtxoWithDerivationPath) {
  const createTaprootPayer = useCurrentAccountTaprootPayer();
  const createNativeSegwitPayer = useCurrentAccountNativeSegwitPayer();
  const networkMode = useBitcoinScureLibNetworkConfig();
  const { utxos: nativeSegwitUtxos } = useCurrentNativeSegwitUtxos();
  const getPayerForInput = useBitcoinPayerFromInput();

  function coverFeeFromAdditionalUtxos(values: OrdinalSendFormValues) {
    if (getAddressInfo(values.inscription.address).type === AddressType.p2wpkh) {
      return formNativeSegwitOrdinalTx(values);
    }

    return formTaprootOrdinalTx(values);
  }

  function formTaprootOrdinalTx(values: OrdinalSendFormValues) {
    const taprootPayer = createTaprootPayer?.({
      changeIndex: extractChangeIndexFromPath(inscriptionInput.derivationPath),
      addressIndex: extractAddressIndexFromPath(inscriptionInput.derivationPath),
    });
    const changePayer = createNativeSegwitPayer?.({ changeIndex: 0, addressIndex: 0 });

    if (!taprootPayer || !changePayer || !nativeSegwitUtxos.available || !values.feeRate) return;

    const result = selectTaprootInscriptionTransferCoins({
      recipient: values.recipient,
      inscriptionInput,
      nativeSegwitUtxos: nativeSegwitUtxos.available,
      changeAddress: changePayer.payment.address!,
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
        tapInternalKey: taprootPayer.payment.tapInternalKey,
        sequence: 0,
        witnessUtxo: {
          script: taprootPayer.payment.script,
          amount: BigInt(inscriptionInput.value),
        },
      });
      signingConfig.push({
        derivationPath: keyOriginToDerivationPath(taprootPayer.keyOrigin),
        index: psbtInputCounter.getValue(),
      });
      psbtInputCounter.increment();

      // Fee-covering Native Segwit inputs
      inputs.forEach(input => {
        const nativeSegwitPayer = getPayerForInput(input);
        tx.addInput({
          txid: input.txid,
          index: input.vout,
          sequence: 0,
          witnessUtxo: {
            amount: BigInt(input.value),
            script: nativeSegwitPayer.payment.script,
          },
        });
        signingConfig.push({
          derivationPath: keyOriginToDerivationPath(nativeSegwitPayer.keyOrigin),
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
    const changePayer = createNativeSegwitPayer?.({ changeIndex: 0, addressIndex: 0 });
    const inscriptionPayer = createNativeSegwitPayer?.({
      changeIndex: extractChangeIndexFromPath(inscriptionInput.derivationPath),
      addressIndex: extractAddressIndexFromPath(inscriptionInput.derivationPath),
    });

    const { feeRate, recipient } = values;
    if (!changePayer || !inscriptionPayer || !nativeSegwitUtxos || !values.feeRate) return;

    const determineUtxosArgs = {
      feeRate,
      recipients: [{ address: recipient, amount: createMoney(0, 'BTC') }],
      utxos: nativeSegwitUtxos.available,
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
          script: inscriptionPayer.payment.script,
        },
      });
      signingConfig.push({
        index: tx.inputsLength - 1,
        derivationPath: keyOriginToDerivationPath(inscriptionPayer.keyOrigin),
      });

      // Fee-covering Native Segwit inputs
      inputs.forEach(input => {
        const payer = getPayerForInput(input);
        tx.addInput({
          txid: input.txid,
          index: input.vout,
          sequence: 0,
          witnessUtxo: {
            amount: BigInt(input.value),
            script: payer.payment.script,
          },
        });
        signingConfig.push({
          index: tx.inputsLength - 1,
          derivationPath: keyOriginToDerivationPath(payer.keyOrigin),
        });
      });

      // Inscription output
      tx.addOutputAddress(values.recipient, BigInt(inscriptionInput.value), networkMode);

      // Recipient and change outputs
      outputs.forEach(output => {
        if (Number(output.value) === 0) return;

        if (!output.address) {
          tx.addOutputAddress(changePayer.address, BigInt(output.value), networkMode);
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
