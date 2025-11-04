import { useState } from 'react';

import { useToastContext } from '@/components/toast/toast-context';
import { ApproverAccountCard } from '@/features/approver/components/approver-account-card';
import { ApproverButtons } from '@/features/approver/components/approver-buttons';
import { OutcomeAddressesCard } from '@/features/approver/components/outcome-addresses-card';
import { StacksOutcome } from '@/features/approver/components/stacks-outcome';
import { MemoSection } from '@/features/approver/memo.section';
import { NonceSection } from '@/features/approver/nonce.section';
import { StacksFeesSection } from '@/features/approver/stacks-fees.section';
import { useStxTransactionUpdatesHandler } from '@/features/approver/stx/hooks';
import {
  ApproverState,
  assertTokenTransferPayload,
  getTotalSpendMoney,
  getTxRecipient,
  useTxOptions,
} from '@/features/approver/utils';
import { useStxMarketDataQuery } from '@/queries/market-data/stx-market-data.query';
import { useBroadcastStacksTransaction } from '@/queries/stacks/use-broadcast-stacks-transaction';
import { useAccountByIndex } from '@/store/accounts/accounts.read';
import { useStacksSigners } from '@/store/keychains/stacks/stacks-keychains.read';
import { assertStacksSigner } from '@/store/keychains/stacks/utils';
import { useNetworkPreferenceStacksNetwork } from '@/store/settings/settings.read';
import { analytics } from '@/utils/analytics';
import { formatCurrency } from '@/utils/currency-formatter';
import { t } from '@lingui/core/macro';
import { PayloadType, deserializeTransaction } from '@stacks/transactions';

import { TransactionTypes, generateStacksUnsignedTransaction } from '@leather.io/stacks';
import { Approver, Box, SentIcon, Text } from '@leather.io/ui/native';
import { baseCurrencyAmountInQuoteWithFallback, createMoney } from '@leather.io/utils';

interface StacksTxSignerProps {
  txHex: string;
  onEdit(): void;
  onSuccess(): void;
  fingerprint: string;
  accountIndex: number;
}

export function StacksTxSigner({
  txHex: _txHex,
  onEdit,
  onSuccess,
  fingerprint,
  accountIndex,
}: StacksTxSignerProps) {
  const stacksNetwork = useNetworkPreferenceStacksNetwork();
  const [txHex, setTxHex] = useState(_txHex);
  const tx = deserializeTransaction(txHex);

  const { displayToast } = useToastContext();

  const { mutateAsync: broadcastTransaction } = useBroadcastStacksTransaction();

  const { data: stxMarketData } = useStxMarketDataQuery();

  assertTokenTransferPayload(tx.payload);

  const recipient = getTxRecipient(tx.payload);
  const principalSpend = createMoney(tx.payload.amount, 'STX');
  const totalSpend = getTotalSpendMoney(tx.payload, tx.auth.spendingCondition.fee);
  const totalSpendQuote = baseCurrencyAmountInQuoteWithFallback(totalSpend, stxMarketData);
  const signer = useStacksSigners().fromAccountIndex(fingerprint, accountIndex)[0];
  assertStacksSigner(signer);

  const account = useAccountByIndex(fingerprint, accountIndex);

  const txOptions = useTxOptions(signer);

  if (!account) throw new Error('No account found');

  const [approverState, setApproverState] = useState<ApproverState>('start');
  async function onSubmitTransaction() {
    setApproverState('submitting');
    assertStacksSigner(signer);

    try {
      const signedTx = await signer?.sign(tx);

      analytics.track('broadcast_transaction', { symbol: 'STX' });
      await broadcastTransaction(
        { tx: signedTx, stacksNetwork },
        {
          onSuccess() {
            setApproverState('submitted');
            setTimeout(() => onSuccess(), 1000);
          },
        }
      );
    } catch {
      displayToast({
        title: t`Failed to broadcast transaction`,
        type: 'error',
      });
      setApproverState('start');
    }
  }

  const { changeFeeToastHandler, changeMemoToastHandler, changeNonceToastHandler } =
    useStxTransactionUpdatesHandler();

  const onChangeMemo = changeMemoToastHandler(async (memo: string) => {
    assertTokenTransferPayload(tx.payload);
    const newTx = await generateStacksUnsignedTransaction({
      txType: TransactionTypes.StxTokenTransfer,
      amount: createMoney(tx.payload.amount, 'STX'),
      fee: createMoney(tx.auth.spendingCondition.fee, 'STX'),
      nonce: Number(tx.auth.spendingCondition.nonce),
      recipient: tx.payload.recipient,
      memo,
      ...txOptions,
    });
    const newTxHex = newTx.serialize();
    setTxHex(newTxHex);
  });

  const onChangeFee = changeFeeToastHandler((fee: number) => {
    tx.setFee(fee);
    const newTxHex = tx.serialize();
    setTxHex(newTxHex);
  });

  const onChangeNonce = changeNonceToastHandler((nonce: string) => {
    tx.setNonce(Number(nonce));
    const newTxHex = tx.serialize();
    setTxHex(newTxHex);
  });

  return (
    <Approver>
      <Approver.Container>
        <Approver.Header title={t`Send token`} />

        <Approver.Overview>
          <Approver.Section mb="-3">
            <Approver.Subheader icon={<SentIcon variant="small" />}>
              {t`You’ll send`}
            </Approver.Subheader>
            <StacksOutcome amount={principalSpend} />
          </Approver.Section>

          <Approver.Section>
            <Approver.Subheader>{t`To address`}</Approver.Subheader>
            <OutcomeAddressesCard addresses={[recipient]} />
          </Approver.Section>
        </Approver.Overview>

        <Approver.Section>
          <ApproverAccountCard accounts={[account]} />
        </Approver.Section>

        <StacksFeesSection txHex={txHex} onChangeFee={onChangeFee} />

        {tx.payload.payloadType === PayloadType.TokenTransfer && (
          <MemoSection memo={tx.payload.memo.content} onChangeMemo={onChangeMemo} isMemoEditable />
        )}

        <NonceSection
          nonce={tx.auth.spendingCondition.nonce.toString()}
          onChangeNonce={onChangeNonce}
        />
      </Approver.Container>

      <Approver.Footer>
        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
          <Text variant="label02">{t`Total spend`}</Text>
          <Text variant="label02">{formatCurrency(totalSpendQuote)}</Text>
        </Box>
        <Approver.Actions>
          <ApproverButtons
            approverState={approverState}
            onBack={onEdit}
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
  );
}
