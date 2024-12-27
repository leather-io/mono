import { useRef, useState } from 'react';

import { useGenerateStxTokenTransferUnsignedTransaction } from '@/common/transactions/stacks-transactions.hooks';
import { formatBalance } from '@/components/balance/balance';
import { useToastContext } from '@/components/toast/toast-context';
import { useStxMarketDataQuery } from '@/queries/market-data/stx-market-data.query';
import { useAccountByIndex } from '@/store/accounts/accounts.read';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { useNetworkPreferenceStacksNetwork } from '@/store/settings/settings.read';
import { destructAccountIdentifier } from '@/store/utils';
import { t } from '@lingui/macro';
import { bytesToHex } from '@stacks/common';
import {
  PayloadType,
  StacksTransaction,
  TokenTransferPayload,
  addressToString,
  deserializeTransaction,
} from '@stacks/transactions';

import { type CryptoCurrency, FeeTypes } from '@leather.io/models';
import { useCalculateStacksTxFees } from '@leather.io/query';
import { Approver, Box, SheetRef, Text } from '@leather.io/ui/native';
import {
  baseCurrencyAmountInQuoteWithFallback,
  convertToMoneyTypeWithDefaultOfZero,
  createMoney,
} from '@leather.io/utils';

import { ApproverAccountCard } from '../approver/components/approver-account-card';
import { ApproverButtons } from '../approver/components/approver-buttons';
import { StacksFeeCard } from '../approver/components/fees/stacks-fee-card';
import { StacksFeesSheet } from '../approver/components/fees/stacks-fee-sheet';
import { MemoCard } from '../approver/components/memo-card';
import { MemoSheet } from '../approver/components/memo-sheet';
import { NonceCard } from '../approver/components/nonce-card';
import { NonceSheet } from '../approver/components/nonce-sheet';
import { OutcomeAddressesCard } from '../approver/components/outcome-addresses-card';
import { StacksOutcome } from '../approver/components/stacks-outcome';
import { ApproverState } from '../approver/utils';
import { useBroadcastStxTransaction } from './use-broadcast-stx-transaction';

function formReviewTxSummary({ tx, symbol }: { tx: StacksTransaction; symbol: CryptoCurrency }) {
  if (symbol !== 'STX') {
    throw new Error('No support for SIP10');
  }
  const payload = tx.payload as TokenTransferPayload;
  const txValue = payload.amount;
  const fee = tx.auth.spendingCondition.fee;
  const totalSpendMoney = convertToMoneyTypeWithDefaultOfZero('STX', Number(txValue + fee));
  const feeMoney = convertToMoneyTypeWithDefaultOfZero('STX', Number(fee));

  return {
    recipient: addressToString(payload.recipient.address),
    feeMoney,
    totalSpendMoney,
    symbol: 'STX',
  };
}
interface StacksTxSignerProps {
  txHex: string;
  onEdit(): void;
  onSuccess(): void;
  accountId: string;
}

export function StacksTxSigner({
  txHex: _txHex,
  onEdit,
  onSuccess,
  accountId,
}: StacksTxSignerProps) {
  const stacksNetwork = useNetworkPreferenceStacksNetwork();
  const [txHex, setTxHex] = useState(_txHex);
  const tx = deserializeTransaction(txHex);
  const { data: stxFees } = useCalculateStacksTxFees(tx);
  const { displayToast } = useToastContext();
  const { fee } = tx.auth.spendingCondition;

  function getFeeType() {
    const estimates = stxFees?.estimates;
    if (Number(fee) === estimates?.[1]?.fee.amount.toNumber()) {
      return FeeTypes.Middle;
    }
    if (Number(fee) === estimates?.[0]?.fee.amount.toNumber()) {
      return FeeTypes.Low;
    }
    if (Number(fee) === estimates?.[2]?.fee.amount.toNumber()) {
      return FeeTypes.High;
    }
    return FeeTypes.Custom;
  }

  const feeSheetRef = useRef<SheetRef>(null);
  const memoSheetRef = useRef<SheetRef>(null);
  const nonceSheetRef = useRef<SheetRef>(null);

  const [selectedFeeType, setSelectedFeeType] = useState<FeeTypes>(getFeeType());
  const fees = {
    [FeeTypes.Low]: stxFees?.estimates[0]?.fee || createMoney(0, 'STX'),
    [FeeTypes.Middle]: stxFees?.estimates[1]?.fee || createMoney(0, 'STX'),
    [FeeTypes.High]: stxFees?.estimates[2]?.fee || createMoney(0, 'STX'),
    [FeeTypes.Unknown]: createMoney(0, 'STX'),
    [FeeTypes.Custom]: createMoney(0, 'STX'),
  };

  const { mutateAsync: broadcastTransaction } = useBroadcastStxTransaction();

  const { data: stxMarketData } = useStxMarketDataQuery();
  const { recipient, feeMoney, totalSpendMoney } = formReviewTxSummary({
    tx,
    symbol: 'STX',
  });
  const { fingerprint, accountIndex } = destructAccountIdentifier(accountId);
  const signer = useStacksSigners().fromAccountIndex(fingerprint, accountIndex)[0];
  if (!signer?.address) throw new Error('No address found');
  if (!signer?.publicKey) throw new Error('No public key found');

  const account = useAccountByIndex(fingerprint, accountIndex);
  const generateTx = useGenerateStxTokenTransferUnsignedTransaction(
    signer?.address,
    bytesToHex(signer?.publicKey)
  );
  async function onChangeFee(feeType: FeeTypes) {
    try {
      if (tx.payload.payloadType === PayloadType.TokenTransfer) {
        const newTx = await generateTx({
          amount: createMoney(tx.payload.amount, 'STX'),
          fee: fees[feeType],
          memo: tx.payload.memo.content,
          nonce: Number(tx.auth.spendingCondition.nonce),
          recipient: tx.payload.recipient,
        });
        const newTxHex = bytesToHex(newTx.serialize());
        setTxHex(newTxHex);
        setSelectedFeeType(feeType);
      }
    } catch {
      displayToast({
        title: t({
          id: 'approver.send.stx.error.change-fee',
          message: 'Failed to change fee',
        }),
        type: 'error',
      });
    }
  }

  async function onChangeNonce(nonce: string) {
    try {
      if (tx.payload.payloadType === PayloadType.TokenTransfer) {
        const newTx = await generateTx({
          amount: createMoney(tx.payload.amount, 'STX'),
          fee: createMoney(tx.auth.spendingCondition.fee, 'STX'),
          memo: tx.payload.memo.content,
          nonce: Number(nonce),
          recipient: tx.payload.recipient,
        });
        const newTxHex = bytesToHex(newTx.serialize());
        setTxHex(newTxHex);
      }
    } catch {
      displayToast({
        title: t({
          id: 'approver.send.stx.error.change-nonce',
          message: 'Failed to change nonce',
        }),
        type: 'error',
      });
    }
  }
  async function onChangeMemo(memo: string) {
    try {
      if (tx.payload.payloadType === PayloadType.TokenTransfer) {
        const newTx = await generateTx({
          amount: createMoney(tx.payload.amount, 'STX'),
          fee: createMoney(tx.auth.spendingCondition.fee, 'STX'),
          memo,
          nonce: Number(tx.auth.spendingCondition.nonce),
          recipient: tx.payload.recipient,
        });
        const newTxHex = bytesToHex(newTx.serialize());
        setTxHex(newTxHex);
      }
    } catch {
      displayToast({
        title: t({
          id: 'approver.send.stx.error.change-memo',
          message: 'Failed to change memo',
        }),
        type: 'error',
      });
    }
  }
  if (!account) {
    throw new Error('No account found');
  }
  const totalSpendUsd = baseCurrencyAmountInQuoteWithFallback(totalSpendMoney, stxMarketData);

  const [approverState, setApproverState] = useState<ApproverState>('start');
  async function onSubmitTransaction() {
    setApproverState('submitting');
    if (!signer) {
      throw new Error('No signer provided');
    }

    try {
      const signedTx = await signer?.sign(tx);
      await broadcastTransaction(
        { tx: signedTx, stacksNetwork },
        {
          onSuccess() {
            setApproverState('submitted');
            setTimeout(() => {
              onSuccess();
            }, 1000);
          },
        }
      );
    } catch (e) {
      displayToast({
        title: t({
          id: 'approver.send.stx.error.broadcast',
          message: 'Failed to broadcast transaction',
        }),
        type: 'error',
      });
      setApproverState('start');
    }
  }

  return (
    <>
      <Approver requester="https://leather.io">
        <Approver.Container>
          <Approver.Header
            title={t({
              id: 'approver.send.title',
              message: 'Send',
            })}
          />
          <Approver.Section>
            <Box />
            <ApproverAccountCard accounts={[account]} />
          </Approver.Section>
          <Approver.Section>
            <StacksOutcome amount={totalSpendMoney} />
            <Box alignSelf="center" bg="ink.border-transparent" height={1} width="100%" my="3" />
            <OutcomeAddressesCard addresses={[recipient]} />
          </Approver.Section>
          <Approver.Section>
            <Box />
            <StacksFeeCard
              feeType={selectedFeeType}
              amount={feeMoney}
              onPress={() => {
                feeSheetRef.current?.present();
              }}
            />
          </Approver.Section>
          <Approver.Section>
            <NonceCard
              nonce={tx.auth.spendingCondition.nonce.toString()}
              onPress={() => {
                nonceSheetRef.current?.present();
              }}
            />
          </Approver.Section>
          {tx.payload.payloadType === PayloadType.TokenTransfer && (
            <Approver.Section>
              <MemoCard
                memo={tx.payload.memo.content}
                onPress={() => {
                  memoSheetRef.current?.present();
                }}
              />
            </Approver.Section>
          )}
        </Approver.Container>
        <Approver.Footer>
          <Box flexDirection="row" alignItems="center" justifyContent="space-between">
            <Text variant="label02">
              {t({
                id: 'approver.total_spend',
                message: 'Total spend',
              })}
            </Text>
            <Text variant="label02">{formatBalance(totalSpendUsd, true)}</Text>
          </Box>
          <Approver.Actions>
            <ApproverButtons
              approverState={approverState}
              onEdit={onEdit}
              onApprove={onSubmitTransaction}
            />
          </Approver.Actions>
        </Approver.Footer>
        {approverState !== 'start' && (
          <Box
            position="absolute"
            top={0}
            bottom={0}
            right={0}
            left={0}
            backgroundColor="ink.background-overlay"
          />
        )}
      </Approver>
      <StacksFeesSheet
        sheetRef={feeSheetRef}
        selectedFeeType={selectedFeeType}
        setSelectedFeeType={setSelectedFeeType}
        onChangeFee={onChangeFee}
        fees={fees}
        currentFee={createMoney(tx.auth.spendingCondition.fee, 'STX')}
      />

      {tx.payload.payloadType === PayloadType.TokenTransfer && (
        <MemoSheet
          sheetRef={memoSheetRef}
          memo={tx.payload.memo.content}
          onChangeMemo={onChangeMemo}
        />
      )}
      <NonceSheet
        sheetRef={nonceSheetRef}
        nonce={tx.auth.spendingCondition.nonce.toString()}
        onChangeNonce={onChangeNonce}
      />
    </>
  );
}
