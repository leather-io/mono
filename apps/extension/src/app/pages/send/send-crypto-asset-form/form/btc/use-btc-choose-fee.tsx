import { useState } from 'react';

import {
  calculateMaxSpendWithinInputLimit,
  compileWshDescriptor,
  findAccountDescriptorKey,
} from '@leather.io/bitcoin';
import { LEDGER_BITCOIN_MAX_INPUTS } from '@leather.io/constants';
import { buildUnsignedMultisigBtcTransfer } from '@leather.io/services';
import { btcToSat, createMoney } from '@leather.io/utils';

import { logger } from '@shared/logger';

import { formFeeRowValue } from '@app/common/send/utils';
import { useGenerateUnsignedBitcoinTx } from '@app/common/transactions/bitcoin/use-generate-bitcoin-tx';
import { OnChooseFeeArgs } from '@app/components/bitcoin-fees-list/bitcoin-fees-list';
import { useLedgerBitcoinInputLimit } from '@app/features/ledger/hooks/use-ledger-bitcoin-input-limit';
import {
  type LedgerBitcoinInputLimit,
  emptyLedgerBitcoinInputLimit,
} from '@app/features/ledger/utils/ledger-bitcoin-input-limit';
import { useSignBitcoinTx } from '@app/store/accounts/blockchain/bitcoin/bitcoin.hooks';
import { useCurrentNativeSegwitAccount } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';
import { createPolicyAddresses } from '@app/store/policy/policy-addresses';
import { useCurrentPolicy } from '@app/store/policy/policy.selectors';

import { useCalculateMaxBitcoinSpend } from '../../../../../common/hooks/balance/use-calculate-max-spend';
import { useSendFormNavigate } from '../../hooks/use-send-form-navigate';
import { useBtcChooseFeeState } from './btc-choose-fee';

export function useBtcChooseFee() {
  const { isSendingMax, txValues, utxos } = useBtcChooseFeeState();
  const sendFormNavigate = useSendFormNavigate();
  const generateTx = useGenerateUnsignedBitcoinTx();
  const calcMaxSpend = useCalculateMaxBitcoinSpend();
  const signTx = useSignBitcoinTx();
  const policy = useCurrentPolicy();
  const nativeSegwitAccount = useCurrentNativeSegwitAccount();
  const network = useCurrentNetwork();
  const { isLedger } = useLedgerBitcoinInputLimit();
  const [ledgerInputLimit, setLedgerInputLimit] = useState<LedgerBitcoinInputLimit>(
    emptyLedgerBitcoinInputLimit
  );
  const amountAsMoney = createMoney(btcToSat(txValues.amount).toNumber(), 'BTC');

  return {
    amountAsMoney,
    ledgerInputLimit,

    async previewTransaction({ feeRate, feeValue, time, isCustomFee }: OnChooseFeeArgs) {
      const feeRowValue = formFeeRowValue(feeRate, isCustomFee);
      setLedgerInputLimit(emptyLedgerBitcoinInputLimit);

      if (policy?.chain === 'bitcoin') {
        const descriptorKey =
          nativeSegwitAccount &&
          findAccountDescriptorKey(
            compileWshDescriptor(policy.descriptor),
            nativeSegwitAccount.keychain
          );
        if (!descriptorKey)
          return sendFormNavigate.toErrorPage(
            new Error('Current account is not a signer of this multisig policy')
          );

        const maxSpend = isSendingMax ? calcMaxSpend(txValues.recipient, utxos, feeRate) : null;

        try {
          const psbt = await buildUnsignedMultisigBtcTransfer({
            descriptor: policy.descriptor,
            multisigAddress: policy.address,
            network: network.chain.bitcoin.mode,
            accountAddresses: createPolicyAddresses(policy),
            recipients: [
              { address: txValues.recipient, amount: maxSpend ? maxSpend.amount : amountAsMoney },
            ],
            feeRate,
            isMaxSpend: isSendingMax,
          });
          return void sendFormNavigate.toConfirmBtcProposal({
            psbt,
            recipient: txValues.recipient,
            fee: feeValue,
            feeRowValue,
            time,
            amount: maxSpend ? maxSpend.spendableBitcoin.toString() : String(txValues.amount),
          });
        } catch (error) {
          return sendFormNavigate.toErrorPage(error);
        }
      }

      const amount = isSendingMax
        ? calcMaxSpend(txValues.recipient, utxos, feeRate).amount
        : amountAsMoney;

      const resp = generateTx(
        {
          amount,
          recipients: [
            {
              address: txValues.recipient,
              amount,
            },
          ],
        },
        feeRate,
        utxos,
        isSendingMax
      );
      if (!resp) return logger.error('Attempted to generate raw tx, but no tx exists');

      if (isLedger && resp.inputs.length > LEDGER_BITCOIN_MAX_INPUTS) {
        setLedgerInputLimit({
          inputCount: resp.inputs.length,
          exceedsLimit: true,
          maxAmountWithinLimit: calculateMaxSpendWithinInputLimit({
            recipient: txValues.recipient,
            utxos,
            feeRate,
            maxInputs: LEDGER_BITCOIN_MAX_INPUTS,
          }).amount,
        });
        return;
      }

      const signedTx = await signTx(resp.psbt, resp.signingConfig);

      if (!signedTx) return logger.error('Attempted to sign tx, but no tx exists');

      signedTx.finalize();

      void sendFormNavigate.toConfirmAndSignBtcTransaction({
        tx: signedTx.hex,
        recipient: txValues.recipient,
        fee: feeValue,
        feeRowValue,
        time,
      });
    },
  };
}
