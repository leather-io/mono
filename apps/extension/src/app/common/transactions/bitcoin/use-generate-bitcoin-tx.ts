import { useCallback, useMemo } from 'react';

import * as btc from '@scure/btc-signer';

import type { Money } from '@leather.io/models';

import { getBitcoinCoinSelectionService } from '@leather.io/services';
import { logger } from '@shared/logger';
import type { TransferRecipient } from '@shared/models/form.model';

import { useBitcoinScureLibNetworkConfig } from '@app/store/accounts/blockchain/bitcoin/bitcoin-keychain';
import { useCurrentAccountNativeSegwitIndexZeroSigner } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useNativeSegwitAccountRequest } from '@app/services/use-native-segwit-account-request';

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
  const signer = useCurrentAccountNativeSegwitIndexZeroSigner();
  const accountRequest = useNativeSegwitAccountRequest();
  const networkMode = useBitcoinScureLibNetworkConfig();
  const coinSelectionService = useMemo(() => getBitcoinCoinSelectionService(), []);

  return useCallback(
    async (
      values: GenerateNativeSegwitTxValues,
      feeRate: number,
      isSendingMax?: boolean
    ) => {
      if (!feeRate) return;

      try {
        const tx = new btc.Transaction();

        const { inputs, outputs, fee } = await coinSelectionService.performCoinSelection(
          {
            account: accountRequest,
            feeRate,
            recipients: values.recipients,
            isMaxSpend: isSendingMax,
          },
          undefined
        );

        logger.info('Coin selection', {
          inputs,
          outputs,
          fee: fee.amount.toString(),
        });

        if (!inputs.length) throw new Error('No inputs to sign');
        if (!outputs.length) throw new Error('No outputs to sign');

        // Is this critical?

        // if (outputs.length > 2)
        //   throw new Error('Address reuse mode: wallet should have max 2 outputs');

        const p2wpkh = btc.p2wpkh(signer.publicKey, networkMode);

        for (const input of inputs) {
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
        }

        outputs.forEach(output => {
          // When coin selection returns output with no address we assume it is
          // a change output
          if (!output.address) {
            tx.addOutputAddress(signer.address, BigInt(output.value), networkMode);
            return;
          }
          tx.addOutputAddress(output.address, BigInt(output.value), networkMode);
        });

        return { hex: tx.hex, fee: fee.amount.toNumber(), psbt: tx.toPSBT(), inputs };
      } catch (e) {
        // eslint-disable-next-line no-console
        console.log('Error signing bitcoin transaction', e);
        if (throwError) throw e;
        return null;
      }
    },
    [accountRequest, coinSelectionService, networkMode, signer.address, signer.publicKey, throwError]
  );
}
