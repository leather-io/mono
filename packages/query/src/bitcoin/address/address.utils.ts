import { BTC_DECIMALS } from '@leather.io/constants';
import type { BitcoinTx, InscriptionAsset, Money } from '@leather.io/models';
import { isEmptyArray, sumNumbers } from '@leather.io/utils';

import { UtxoResponseItem } from '../../types/utxo';

export function createBitcoinCryptoCurrencyAssetTypeWrapper(balance: Money) {
  return {
    blockchain: 'bitcoin',
    balance,
    asset: {
      decimals: BTC_DECIMALS,
      hasMemo: true,
      name: 'Bitcoin',
      symbol: 'BTC',
    },
    type: 'crypto-currency',
  };
}

export function hasInscriptions(utxos: UtxoResponseItem[]) {
  return !isEmptyArray(utxos);
}

export function calculateOutboundPendingTxsValue(pendingTxs: BitcoinTx[], address: string) {
  // sum all inputs
  const sumInputs = sumNumbers(pendingTxs.flatMap(tx => tx.vin.map(input => input.prevout.value)));

  // get all outputs that are sent back to the address
  const returnedOutputChangeValues = pendingTxs
    .flatMap(tx => tx.vout.map(output => output))
    .filter(v => v.scriptpubkey_address === address)
    .flatMap(output => output.value);

  // sum all filtered outputs
  const sumOutputs = sumNumbers(returnedOutputChangeValues);

  return sumInputs.minus(sumOutputs).toNumber();
}

interface UtxoIdentifier {
  txid: string;
  vout: number;
}

export function filterUtxosWithInscriptions(inscriptions: InscriptionAsset[]) {
  return <T extends UtxoIdentifier>(utxo: T) => {
    return !inscriptions.some(
      inscription =>
        `${utxo.txid}:${utxo.vout.toString()}` === `${inscription.txid}:${inscription.output}`
    );
  };
}
