import { useMemo } from 'react';
import { useNavigate } from 'react-router';

import * as btc from '@scure/btc-signer';
import BigNumber from 'bignumber.js';
import * as yup from 'yup';

import { isP2TROut } from '@leather.io/bitcoin';
import type { BitcoinTx } from '@leather.io/models';
import { emptyUtxos } from '@leather.io/services';
import { btcToSat, createMoney, isError, sumMoney } from '@leather.io/utils';

import type { BitcoinInputSigningConfig } from '@shared/crypto/bitcoin/signer-config';
import { RouteUrls } from '@shared/route-urls';
import { analytics } from '@shared/utils/analytics';

import { queryClient } from '@app/common/persistence';
import {
  getBitcoinTxSizeEstimation,
  getBitcoinTxValue,
  getRecipientAddressFromOutput,
} from '@app/common/transactions/bitcoin/utils';
import { MAX_FEE_RATE_MULTIPLIER } from '@app/components/bitcoin-custom-fee/hooks/use-bitcoin-custom-fee';
import { useBitcoinFeesList } from '@app/components/bitcoin-fees-list/use-bitcoin-fees-list';
import { useToast } from '@app/features/toasts/use-toast';
import { useCurrentBtcBalanceWithFallback } from '@app/query/bitcoin/balance/btc-balance.hooks';
import { useBitcoinBroadcastTransaction } from '@app/query/bitcoin/transaction/use-bitcoin-broadcast-transaction';
import { useCurrentNativeSegwitUtxos } from '@app/query/bitcoin/utxos/utxos.hooks';
import { useBitcoinScureLibNetworkConfig } from '@app/store/accounts/blockchain/bitcoin/bitcoin-keychain';
import { useBitcoinPayerFromInput } from '@app/store/accounts/blockchain/bitcoin/bitcoin-payer';
import { useSignBitcoinTx } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';
import { useCurrentAccountNativeSegwitIndexZeroPayer } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

export function useBtcIncreaseFee(btcTx: BitcoinTx) {
  const toast = useToast();
  const navigate = useNavigate();
  const networkMode = useBitcoinScureLibNetworkConfig();

  const {
    address: currentBitcoinAddress,
    publicKey,
    derivationPath: zeroIndexDerivationPath,
  } = useCurrentAccountNativeSegwitIndexZeroPayer();
  const { utxos, refetchUtxos } = useCurrentNativeSegwitUtxos();
  const signTransaction = useSignBitcoinTx();
  const { broadcastTx, isBroadcasting } = useBitcoinBroadcastTransaction();
  const getPayerForOwnedUtxo = useBitcoinPayerFromInput();
  const recipient = getRecipientAddressFromOutput(btcTx.vout, currentBitcoinAddress) || '';

  const sizeInfo = useMemo(
    () =>
      getBitcoinTxSizeEstimation({
        inputCount: btcTx.vin.length,
        recipient,
        outputCount: btcTx.vout.length,
      }),
    [btcTx.vin.length, btcTx.vout.length, recipient]
  );

  const { btc: balance } = useCurrentBtcBalanceWithFallback();
  const rbfAvailableBalance = sumMoney([balance.availableBalance, balance.outboundBalance]);
  const sendingAmount = getBitcoinTxValue(address => address === currentBitcoinAddress, btcTx);
  const { feesList } = useBitcoinFeesList({
    amount: createMoney(btcToSat(sendingAmount), 'BTC'),
    isSendingMax: false,
    recipient,
    utxos: utxos.available,
  });

  function generateUnsignedTx(payload: { feeRate: string; tx: BitcoinTx }) {
    const newTx = new btc.Transaction();
    const { vin, vout, fee: prevFee } = payload.tx;
    const p2wpkh = btc.p2wpkh(publicKey, networkMode);
    const rbfAvailableUtxos = [
      ...(utxos ?? emptyUtxos).available,
      ...(utxos ?? emptyUtxos).outbound,
    ];
    const utxoMap = new Map(rbfAvailableUtxos.map(utxo => [`${utxo.txid}:${utxo.vout}`, utxo]));
    const signingConfig: BitcoinInputSigningConfig[] = [];

    vin.forEach(input => {
      const ownedUtxo = utxoMap.get(`${input.txid}:${input.vout}`);
      const payer = ownedUtxo ? getPayerForOwnedUtxo(ownedUtxo) : null;

      const tapInternalKey = isP2TROut(payer)
        ? { tapInternalKey: payer.payment.tapInternalKey }
        : {};

      newTx.addInput({
        txid: input.txid,
        index: input.vout,
        sequence: input.sequence + 1,
        witnessUtxo: {
          // script = 0014 + pubKeyHash
          script: payer ? payer.payment.script : p2wpkh.script,
          amount: ownedUtxo ? BigInt(ownedUtxo.value) : BigInt(input.prevout.value),
        },
        ...tapInternalKey,
      });

      signingConfig.push({
        index: newTx.inputsLength - 1,
        derivationPath: payer ? payer.derivationPath : zeroIndexDerivationPath,
      });
    });

    const newFee = Math.ceil(sizeInfo.txVBytes * Number(payload.feeRate));
    const feeDiff = newFee - prevFee;

    vout.forEach(output => {
      if (output.scriptpubkey_address === currentBitcoinAddress) {
        const outputDiff = output.value - feeDiff;

        if (outputDiff < 0) {
          analytics.track('bitcoin_rbf_fee_increase_error', {
            outputDiff,
          });
          throw new Error('Previous tx inputs cannot cover new fee');
        }

        newTx.addOutputAddress(currentBitcoinAddress, BigInt(outputDiff), networkMode);
        return;
      }
      newTx.addOutputAddress(recipient, BigInt(output.value), networkMode);
    });

    return { tx: newTx, signingConfig };
  }

  async function initiateTransaction(
    unsignedTx: btc.Transaction,
    signingConfig: BitcoinInputSigningConfig[]
  ) {
    const tx = await signTransaction(unsignedTx.toPSBT(), signingConfig);
    tx.finalize();
    await broadcastTx({
      tx: tx.hex,
      async onSuccess(txid) {
        toast.success('Fee increased successfully');
        void navigate(RouteUrls.Activity);
        analytics.track('increase_fee_transaction', {
          symbol: 'btc',
          txid,
        });
        await refetchUtxos();
        void queryClient.invalidateQueries({ queryKey: ['btc-txs-by-address'] });
      },
      onError,
      delayTime: 5000,
    });
  }

  async function onSubmit(values: { feeRate: string }) {
    try {
      const { tx, signingConfig } = generateUnsignedTx({ feeRate: values.feeRate, tx: btcTx });
      await initiateTransaction(tx, signingConfig);
    } catch (e) {
      onError(e);
    }
  }

  function onError(error: unknown) {
    const message = isError(error) ? error.message : 'Unknown error';
    toast.error(message);
    void navigate(RouteUrls.Home);
  }

  const validationSchema = yup.object({
    feeRate: yup
      .number()
      .integer('Fee must be a whole number')
      .required('Fee is required')
      .test({
        message: 'Fee rate cannot be less or equal to previous',
        test(value) {
          const bnValue = new BigNumber(value);
          const prevFee = new BigNumber(btcTx.fee);

          return prevFee.isLessThan(bnValue.multipliedBy(sizeInfo.txVBytes));
        },
      })
      .test({
        message: 'Fee is too high',
        test(value) {
          const bnValue = new BigNumber(value);

          // check if fee is higher than 50 times the highest fee
          if (
            feesList.length > 0 &&
            bnValue.isGreaterThan(feesList[0].feeRate * MAX_FEE_RATE_MULTIPLIER)
          ) {
            return false;
          }

          // check if fee is higher than the available balance
          return bnValue.isLessThanOrEqualTo(rbfAvailableBalance.amount);
        },
      }),
  });

  return {
    generateTx: generateUnsignedTx,
    initiateTransaction,
    isBroadcasting,
    sizeInfo,
    onSubmit,
    validationSchema,
    recipient,
  };
}
