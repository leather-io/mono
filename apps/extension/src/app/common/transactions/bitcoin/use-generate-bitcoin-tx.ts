import { useCallback } from 'react';

import * as btc from '@scure/btc-signer';

import {
  determineUtxosForSpend,
  determineUtxosForSpendAll,
  isTaprootPayer,
} from '@leather.io/bitcoin';
import { keyOriginToDerivationPath } from '@leather.io/crypto';
import type { Money, OwnedUtxo } from '@leather.io/models';

import { BitcoinInputSigningConfig } from '@shared/crypto/bitcoin/signer-config';
import { logger } from '@shared/logger';
import type { TransferRecipient } from '@shared/models/form.model';

import { useBitcoinScureLibNetworkConfig } from '@app/store/accounts/blockchain/bitcoin/bitcoin-keychain';
import { useBitcoinPayerFromInput } from '@app/store/accounts/blockchain/bitcoin/bitcoin-payer';
import { useCurrentAccountNativeSegwitIndexZeroPayer } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

interface GenerateBitcoinTxValues {
  amount: Money;
  recipients: TransferRecipient[];
}

interface UseGenerateUnsignedBitcoinTxProps {
  throwError?: boolean;
}

// This should be replace by generateBitcoinUnsignedTransaction from @leather.io/bitcoin package in the future
export function useGenerateUnsignedBitcoinTx({
  throwError = false,
}: UseGenerateUnsignedBitcoinTxProps = {}) {
  const indexZeroPayer = useCurrentAccountNativeSegwitIndexZeroPayer();
  const getPayerForInput = useBitcoinPayerFromInput();

  const networkMode = useBitcoinScureLibNetworkConfig();

  return useCallback(
    (
      values: GenerateBitcoinTxValues,
      feeRate: number,
      utxos: OwnedUtxo[],
      isSendingMax?: boolean
    ) => {
      if (!utxos.length) return;
      if (!feeRate) return;

      try {
        const tx = new btc.Transaction();

        const determineUtxosArgs = {
          feeRate,
          recipients: values.recipients,
          utxos,
        };

        const { inputs, outputs, fee } = isSendingMax
          ? determineUtxosForSpendAll(determineUtxosArgs)
          : determineUtxosForSpend(determineUtxosArgs);

        logger.info('Coin selection', { inputs, outputs, fee });

        if (!inputs.length) throw new Error('No inputs to sign');
        if (!outputs.length) throw new Error('No outputs to sign');

        const signingConfig: BitcoinInputSigningConfig[] = [];

        for (const input of inputs) {
          const inputPayer = getPayerForInput(input);
          const tapInternalKey = isTaprootPayer(inputPayer)
            ? { tapInternalKey: inputPayer.payment.tapInternalKey }
            : {};

          tx.addInput({
            txid: input.txid,
            index: input.vout,
            sequence: 0,
            witnessUtxo: {
              script: inputPayer.payment.script,
              amount: BigInt(input.value),
            },
            ...tapInternalKey,
          });

          signingConfig.push({
            index: tx.inputsLength - 1,
            derivationPath: keyOriginToDerivationPath(inputPayer.keyOrigin),
          });
        }

        outputs.forEach(output => {
          // When coin selection returns output with no address we assume it is
          // a change output
          if (!output.address) {
            tx.addOutputAddress(indexZeroPayer.address, BigInt(output.value), networkMode);
            return;
          }
          tx.addOutputAddress(output.address, BigInt(output.value), networkMode);
        });

        return {
          hex: tx.hex,
          fee: fee.amount.toNumber(),
          psbt: tx.toPSBT(),
          inputs,
          signingConfig,
        };
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('Error signing bitcoin transaction', e);
        if (throwError) throw e;
        return null;
      }
    },
    [networkMode, indexZeroPayer.address, getPayerForInput, throwError]
  );
}
