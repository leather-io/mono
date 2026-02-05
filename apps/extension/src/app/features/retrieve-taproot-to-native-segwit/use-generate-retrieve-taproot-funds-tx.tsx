import { useCallback, useMemo } from 'react';

import * as btc from '@scure/btc-signer';

import { BtcSizeFeeEstimator } from '@leather.io/bitcoin';
import { extractAddressIndexFromPath, extractChangeIndexFromPath } from '@leather.io/crypto';
import type { Money } from '@leather.io/models';
import { createMoney, sumNumbers } from '@leather.io/utils';

import { useAverageBitcoinFeeRates } from '@app/query/bitcoin/fees/fee-estimates.hooks';
import { useNumberOfInscriptionsOnUtxo } from '@app/query/bitcoin/ordinals/inscriptions/inscriptions.query';
import { useCurrentTaprootUninscribedUtxos } from '@app/query/bitcoin/utxos/utxos.hooks';
import { useCurrentAccountId } from '@app/store/accounts/account';
import {
  useBitcoinScureLibNetworkConfig,
  useBitcoinSoftwareSignerLookup,
} from '@app/store/accounts/blockchain/bitcoin/bitcoin-keychain';
import { useCurrentAccountTaprootPayer } from '@app/store/accounts/blockchain/bitcoin/taproot-account.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

export function useGenerateRetrieveTaprootFundsTx() {
  const networkMode = useBitcoinScureLibNetworkConfig();
  const account = useCurrentAccountId();
  const network = useCurrentNetwork();

  const { utxos: uninscribedUtxos } = useCurrentTaprootUninscribedUtxos();

  const createPayer = useCurrentAccountTaprootPayer();
  const signingCallbacksLookup = useBitcoinSoftwareSignerLookup();
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
        const payer = createPayer?.({
          addressIndex: extractAddressIndexFromPath(utxo.path),
          changeIndex: extractChangeIndexFromPath(utxo.path),
        });
        if (!payer) return;

        tx.addInput({
          txid: utxo.txid,
          index: utxo.vout,
          tapInternalKey: payer.payment.tapInternalKey,
          witnessUtxo: {
            script: payer.payment.script,
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

      const getSigner = signingCallbacksLookup(account.fingerprint);
      if (!getSigner) throw new Error('Signing callbacks not available');

      uninscribedUtxos.forEach(utxo => {
        const callbacks = getSigner({
          paymentType: 'p2tr',
          network: network.chain.bitcoin.mode,
          accountIndex: account.accountIndex,
          changeIndex: extractChangeIndexFromPath(utxo.path),
          addressIndex: extractAddressIndexFromPath(utxo.path),
        });
        callbacks.sign(tx);
      });

      tx.finalize();
      return tx.hex;
    },
    [
      account.accountIndex,
      account.fingerprint,
      createPayer,
      getNumberOfInscriptionOnUtxo,
      network.chain.bitcoin.mode,
      networkMode,
      signingCallbacksLookup,
      uninscribedUtxos,
    ]
  );

  return { generateRetrieveTaprootFundsTx, fee };
}
