import { useCallback } from 'react';

import * as btc from '@scure/btc-signer';

import { determineUtxosForSpend, determineUtxosForSpendAll } from '@leather.io/bitcoin';
import type { Money, OwnedUtxo } from '@leather.io/models';

import { BitcoinInputSigningConfig } from '@shared/crypto/bitcoin/signer-config';
import { logger } from '@shared/logger';
import type { TransferRecipient } from '@shared/models/form.model';

import { useBitcoinScureLibNetworkConfig } from '@app/store/accounts/blockchain/bitcoin/bitcoin-keychain';
import { useBitcoinPayerFromInput } from '@app/store/accounts/blockchain/bitcoin/bitcoin-payer';
import { useCurrentAccountNativeSegwitIndexZeroPayer } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

interface GenerateNativeSegwitTxValues {
  amount: Money;
  recipients: TransferRecipient[];
}

interface UseGenerateUnsignedNativeSegwitTxProps {
  throwError?: boolean;
}

// temp arg before refactoring all flows to new design
export function useGenerateUnsignedNativeSegwitTx({
  throwError = false,
}: UseGenerateUnsignedNativeSegwitTxProps = {}) {
  const indexZeroPayer = useCurrentAccountNativeSegwitIndexZeroPayer();
  const getPayerForInput = useBitcoinPayerFromInput();

  const networkMode = useBitcoinScureLibNetworkConfig();

  return useCallback(
    (
      values: GenerateNativeSegwitTxValues,
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

        // Is this critical?

        // if (outputs.length > 2)
        //   throw new Error('Address reuse mode: wallet should have max 2 outputs');

        const signingConfig: BitcoinInputSigningConfig[] = [];

        for (const input of inputs) {
          const inputPayer = getPayerForInput(input);

          const p2wpkh = btc.p2wpkh(inputPayer.publicKey, networkMode);

          tx.addInput({
            txid: input.txid,
            index: input.vout,
            sequence: 0,
            witnessUtxo: {
              // script = 0014 + pubKeyHash
              script: p2wpkh.script,
              amount: BigInt(input.value),
            },
          });

          signingConfig.push({
            index: tx.inputsLength - 1,
            derivationPath: inputPayer.derivationPath,
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
