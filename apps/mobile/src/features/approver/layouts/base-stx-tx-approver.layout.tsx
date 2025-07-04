import { ApproverAccountCard } from '@/features/approver/components/approver-account-card';
import { OutcomeAddressesCard } from '@/features/approver/components/outcome-addresses-card';
import { StacksOutcome } from '@/features/approver/components/stacks-outcome';
import { ContractCallArgsSection } from '@/features/approver/contract-call-args.section';
import { ContractCallSummarySection } from '@/features/approver/contract-call-summary.section';
import { ContractDeployCodeSection } from '@/features/approver/contract-deploy-code.section';
import { ContractDeploySummarySection } from '@/features/approver/contract-deploy-summary.section';
import { MemoSection } from '@/features/approver/memo.section';
import { NonceSection } from '@/features/approver/nonce.section';
import { StacksFeesSection } from '@/features/approver/stacks-fees.section';
import {
  TxOptions,
  assertTokenTransferPayload,
  getTotalSpendMoney,
  getTxRecipient,
  isContractCall,
  isContractDeploy,
  isTokenTransfer,
} from '@/features/approver/utils';
import { Account } from '@/store/accounts/accounts';
import { makeAccountIdentifer } from '@/store/utils';
import { t } from '@lingui/macro';
import { deserializeTransaction, isTokenTransferPayload } from '@stacks/transactions';

import { TransactionTypes, generateStacksUnsignedTransaction } from '@leather.io/stacks';
import { Approver, Button, SentIcon } from '@leather.io/ui/native';
import { createMoney } from '@leather.io/utils';

import { useStxTransactionUpdatesHandler } from '../stx/hooks';

interface BaseStxTxApproverLayoutProps {
  onApprove(): void;
  onCloseApprover(): void;
  accountId: string | null;
  accounts: Account[];
  txHex: string;
  setTxHex(txHex: string): void;
  txOptions: TxOptions;
  origin?: string;
}

export function BaseStxTxApproverLayout({
  onApprove,
  onCloseApprover,
  accountId,
  accounts,
  txHex,
  setTxHex,
  txOptions,
  origin,
}: BaseStxTxApproverLayoutProps) {
  const tx = deserializeTransaction(txHex);
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
    <Approver requester={origin}>
      <Approver.Container>
        <Approver.Header
          title={t({
            id: 'approver.signTransaction.title',
            message: 'Sign Transaction',
          })}
        />
        <Approver.Section>
          <ApproverAccountCard
            accounts={accounts.filter(
              acc => makeAccountIdentifer(acc.fingerprint, acc.accountIndex) === accountId
            )}
          />
        </Approver.Section>
        {isContractCall(tx.payload) && <ContractCallSummarySection txHex={txHex} />}
        {isContractDeploy(tx.payload) && <ContractDeploySummarySection txHex={txHex} />}
        {isTokenTransferPayload(tx.payload) && (
          <Approver.Overview>
            <Approver.Section mb="-3">
              <Approver.Subheader icon={<SentIcon variant="small" />}>
                {t({ id: 'approver.outcomes.title1', message: 'You’ll send' })}
              </Approver.Subheader>

              <StacksOutcome
                amount={getTotalSpendMoney(tx.payload, tx.auth.spendingCondition.fee)}
              />
            </Approver.Section>

            <Approver.Section>
              <Approver.Subheader>
                {t({ id: 'approver.outcomes.title2', message: 'To address' })}
              </Approver.Subheader>

              <OutcomeAddressesCard addresses={[getTxRecipient(tx.payload)]} />
            </Approver.Section>
          </Approver.Overview>
        )}
        <StacksFeesSection txHex={txHex} onChangeFee={onChangeFee} />
        {isTokenTransfer(tx.payload) && (
          <MemoSection
            memo={tx.payload.memo.content}
            isMemoEditable={false}
            onChangeMemo={onChangeMemo}
          />
        )}
        <Approver.Advanced
          titleClosed={t({
            id: 'approver.advanced.show',
            message: 'Show advanced options',
          })}
          titleOpened={t({
            id: 'approver.advanced.hide',
            message: 'Hide advanced options',
          })}
        >
          {isContractCall(tx.payload) && <ContractCallArgsSection txHex={txHex} />}
          {isContractDeploy(tx.payload) && <ContractDeployCodeSection txHex={txHex} />}
          <NonceSection
            nonce={tx.auth.spendingCondition.nonce.toString()}
            onChangeNonce={onChangeNonce}
          />
        </Approver.Advanced>
      </Approver.Container>
      <Approver.Footer>
        <Approver.Actions>
          <Button
            buttonState="outline"
            title={t({
              id: 'approver.button.deny',
              message: 'Deny',
            })}
            flex={1}
            onPress={onCloseApprover}
          />
          <Button
            buttonState="default"
            title={t({
              id: 'approver.button.approve',
              message: 'Approve',
            })}
            flex={1}
            onPress={onApprove}
          />
        </Approver.Actions>
      </Approver.Footer>
    </Approver>
  );
}
