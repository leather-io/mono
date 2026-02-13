import { useCallback, useMemo } from 'react';

import * as btc from '@scure/btc-signer';

import { BtcSizeFeeEstimator } from '@leather.io/bitcoin';
import { extractAddressIndexFromPath, extractChangeIndexFromPath } from '@leather.io/crypto';
import type { Money } from '@leather.io/models';
import { createMoney, sumNumbers } from '@leather.io/utils';

import { useAverageBitcoinFeeRates } from '@app/query/bitcoin/fees/fee-estimates.hooks';
import { useNumberOfInscriptionsOnUtxo } from '@app/query/bitcoin/ordinals/inscriptions/inscriptions.query';
import { useCurrentTaprootUninscribedUtxos } from '@app/query/bitcoin/utxos/utxos.hooks';
import { useBitcoinScureLibNetworkConfig } from '@app/store/accounts/blockchain/bitcoin/bitcoin-keychain';
import { useCurrentAccountTaprootSigner } from '@app/store/accounts/blockchain/bitcoin/taproot-account.hooks';

export function useGenerateRetrieveTaprootFundsTx() {
  const networkMode = useBitcoinScureLibNetworkConfig();

  const { utxos: uninscribedUtxos } = useCurrentTaprootUninscribedUtxos();

  const createSigner = useCurrentAccountTaprootSigner();
  const { data: feeRates } = useAverageBitcoinFeeRates();
  const getNumberOfInscriptionOnUtxo = useNumberOfInscriptionsOnUtxo();

  const fee = useMemo(() => {
    if (!feeRates) return createMoney(0, 'BTC');
    const txSizer = new BtcSizeFeeEstimator();
    const { txVBytes } = txSizer.calcTxSize({
      input_count: uninscribedUtxos.length,
      p2wpkh_output_count: 1,
    });
    return createMoney(Math.ceil(txVBytes * feeRates.hourFee.toNumber()), 'BTC');
  }, [feeRates, uninscribedUtxos.length]);

  const generateRetrieveTaprootFundsTx = useCallback(
    ({ recipient, fee }: { recipient: string; fee: Money }) => {
      const tx = new btc.Transaction();
      const totalAmount = sumNumbers(uninscribedUtxos.map(utxo => utxo.value));

      uninscribedUtxos.forEach(utxo => {
        const signer = createSigner?.({
          addressIndex: extractAddressIndexFromPath(utxo.path),
          changeIndex: extractChangeIndexFromPath(utxo.path),
        });
        if (!signer) return;

        tx.addInput({
          txid: utxo.txid,
          index: utxo.vout,
          tapInternalKey: signer.payment.tapInternalKey,
          witnessUtxo: {
            script: signer.payment.script,
            amount: BigInt(utxo.value),
          },
        });
      });

      const zeroInscriptionCheckResults = uninscribedUtxos.map(utxo =>
        getNumberOfInscriptionOnUtxo(utxo.txid, utxo.vout)
      );

      if (!zeroInscriptionCheckResults.every(inscriptionCount => inscriptionCount === 0)) {
        throw new Error('Inscription found in utxos');
      }

      const paymentAmount = BigInt(totalAmount.minus(fee.amount.toString()).toString());

      tx.addOutputAddress(recipient, paymentAmount, networkMode);

      uninscribedUtxos.forEach(utxo => {
        return createSigner?.({
          addressIndex: extractAddressIndexFromPath(utxo.path),
          changeIndex: extractChangeIndexFromPath(utxo.path),
        }).sign(tx);
      });

      tx.finalize();
      return tx.hex;
    },
    [createSigner, getNumberOfInscriptionOnUtxo, networkMode, uninscribedUtxos]
  );

  return { generateRetrieveTaprootFundsTx, fee };
}
