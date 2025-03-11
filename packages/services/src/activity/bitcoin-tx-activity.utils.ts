import { btcCryptoAsset } from '@leather.io/constants';
import {
  AccountAddresses,
  ActivityLevels,
  OnChainActivityStatuses,
  OnChainActivityTypes,
  ReceiveAssetActivity,
  SendAssetActivity,
} from '@leather.io/models';
import { dateToUnixTimestamp, isDefined, sumNumbers, uniqueArray } from '@leather.io/utils';

import { LeatherApiBitcoinTransaction } from '../infrastructure/api/leather/leather-api.client';

export function mapBitcoinTxBlockTime(tx: LeatherApiBitcoinTransaction) {
  return tx.height && tx.time ? tx.time : dateToUnixTimestamp(new Date());
}

export function mapBitcoinTxStatus(tx: LeatherApiBitcoinTransaction) {
  return tx.height ? OnChainActivityStatuses.success : OnChainActivityStatuses.pending;
}

export function mapBitcoinTxToActivity(
  tx: LeatherApiBitcoinTransaction,
  account: AccountAddresses
): SendAssetActivity | ReceiveAssetActivity | undefined {
  const isSend = tx.vin.some(input => input.owned);
  const isReceive = tx.vout.some(output => output.owned);
  if (!isSend && !isReceive) return;
  const ownedInputAmount = sumNumbers(
    tx.vin.filter(input => input.owned).map(input => Number(input.value))
  );
  const ownedOutputAmount = sumNumbers(
    tx.vout.filter(output => output.owned).map(output => Number(output.value))
  );

  const commonProps = {
    level: ActivityLevels.account,
    timestamp: mapBitcoinTxBlockTime(tx),
    account: account.id,
    txid: tx.txid,
    status: mapBitcoinTxStatus(tx),
    asset: btcCryptoAsset,
  };

  return isSend
    ? {
        ...commonProps,
        type: OnChainActivityTypes.sendAsset,
        amount: ownedInputAmount.minus(ownedOutputAmount),
        receivers: uniqueArray(
          tx.vout
            .filter(vout => !vout.owned)
            .map(vout => vout.address)
            .filter(isDefined)
        ),
      }
    : {
        ...commonProps,
        type: OnChainActivityTypes.receiveAsset,
        amount: ownedOutputAmount,
        senders: uniqueArray(
          tx.vin
            .filter(vin => !vin.owned)
            .map(vin => vin.address)
            .filter(isDefined)
        ),
      };
}
