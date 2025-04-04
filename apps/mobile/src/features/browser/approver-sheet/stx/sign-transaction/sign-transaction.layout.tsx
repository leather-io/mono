import { ApproverAccountCard } from '@/features/approver/components/approver-account-card';
import { MemoSection } from '@/features/approver/memo.section';
import { NonceSection } from '@/features/approver/nonce.section';
import { StacksFeesSection } from '@/features/approver/stacks-fees.section';
import { TxOptions } from '@/features/approver/utils';
import { Account } from '@/store/accounts/accounts';
import { makeAccountIdentifer } from '@/store/utils';
import { t } from '@lingui/macro';

import { Approver, Box, Button } from '@leather.io/ui/native';

interface SignTransactionApproverLayoutProps {
  onApprove(): void;
  onCloseApprover(): void;
  accountId: string | null;
  accounts: Account[];
  txHex: string;
  setTxHex(txHex: string): void;
  txOptions: TxOptions;
}

export function SignTransactionApproverLayout({
  onApprove,
  onCloseApprover,
  accountId,
  accounts,
  txHex,
  setTxHex,
  txOptions,
}: SignTransactionApproverLayoutProps) {
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
          <StacksFeesSection txHex={txHex} setTxHex={setTxHex} txOptions={txOptions} />
          <NonceSection txHex={txHex} setTxHex={setTxHex} txOptions={txOptions} />
          <MemoSection
            txHex={txHex}
            setTxHex={setTxHex}
            txOptions={txOptions}
            isMemoEditable={false}
          />
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
