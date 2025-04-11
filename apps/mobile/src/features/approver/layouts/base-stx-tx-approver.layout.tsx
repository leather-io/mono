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
import { TxOptions, getTotalSpendMoney, getTxRecipient } from '@/features/approver/utils';
import { Account } from '@/store/accounts/accounts';
import { makeAccountIdentifer } from '@/store/utils';
import { t } from '@lingui/macro';
import { PayloadType, deserializeTransaction } from '@stacks/transactions';

import { Approver, Box, Button } from '@leather.io/ui/native';

interface BaseStxTxApproverLayoutProps {
  onApprove(): void;
  onCloseApprover(): void;
  accountId: string | null;
  accounts: Account[];
  txHex: string;
  setTxHex(txHex: string): void;
  txOptions: TxOptions;
}

export function BaseStxTxApproverLayout({
  onApprove,
  onCloseApprover,
  accountId,
  accounts,
  txHex,
  setTxHex,
  txOptions,
}: BaseStxTxApproverLayoutProps) {
  const tx = deserializeTransaction(txHex);
  return (
    <Box flex={1} backgroundColor="ink.background-secondary">
      <Approver>
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
          {tx.payload.payloadType === PayloadType.ContractCall && (
            <ContractCallSummarySection txHex={txHex} />
          )}
          {tx.payload.payloadType === PayloadType.VersionedSmartContract && (
            <ContractDeploySummarySection txHex={txHex} />
          )}
          {tx.payload.payloadType === PayloadType.TokenTransfer && (
            <Approver.Section>
              <StacksOutcome
                amount={getTotalSpendMoney(tx.payload, tx.auth.spendingCondition.fee)}
              />
              <Box alignSelf="center" bg="ink.border-transparent" height={1} width="100%" my="3" />
              <OutcomeAddressesCard addresses={[getTxRecipient(tx.payload)]} />
            </Approver.Section>
          )}

          <StacksFeesSection txHex={txHex} setTxHex={setTxHex} />
          {tx.payload.payloadType === PayloadType.TokenTransfer && (
            <MemoSection
              txHex={txHex}
              setTxHex={setTxHex}
              txOptions={txOptions}
              isMemoEditable={false}
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
            {tx.payload.payloadType === PayloadType.ContractCall && (
              <ContractCallArgsSection txHex={txHex} />
            )}
            {tx.payload.payloadType === PayloadType.VersionedSmartContract && (
              <ContractDeployCodeSection txHex={txHex} />
            )}
            <NonceSection txHex={txHex} setTxHex={setTxHex} />
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
                message: 'Confirm',
              })}
              flex={1}
              onPress={onApprove}
            />
          </Approver.Actions>
        </Approver.Footer>
      </Approver>
    </Box>
  );
}
