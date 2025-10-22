import { ApproverAccountCard } from '@/features/approver/components/approver-account-card';
import { ApproverButtons } from '@/features/approver/components/approver-buttons';
import { Account } from '@/store/accounts/accounts';
import { t } from '@lingui/core/macro';

import { makeAccountIdentifer } from '@leather.io/crypto';
import { Approver, Cell, ChevronRightIcon, Text } from '@leather.io/ui/native';

interface SignMessageApproverLayoutProps {
  onApprove(): Promise<void>;
  onOpenAccountSelection(): void;
  onCloseApprover(): void;
  selectedAccountId: string | null;
  accounts: Account[];
  messageToSign: string;
}

export function SignMessageApproverLayout({
  onApprove,
  onOpenAccountSelection,
  onCloseApprover,
  selectedAccountId,
  accounts,
  messageToSign,
}: SignMessageApproverLayoutProps) {
  return (
    <Approver>
      <Approver.Container>
        <Approver.Header title={t`Sign Message`} />
        <Approver.Section>
          {selectedAccountId ? (
            <ApproverAccountCard
              accounts={accounts.filter(
                acc => makeAccountIdentifer(acc.fingerprint, acc.accountIndex) === selectedAccountId
              )}
              onPress={onOpenAccountSelection}
            />
          ) : (
            <Cell.Root pressable={true} onPress={onOpenAccountSelection}>
              <Cell.Content>
                <Cell.Label variant="primary">{t`Choose an account`}</Cell.Label>
              </Cell.Content>
              <Cell.Aside>
                <ChevronRightIcon />
              </Cell.Aside>
            </Cell.Root>
          )}
        </Approver.Section>
        <Approver.Section>
          <Text variant="label01">{t`Message`}</Text>
          <Cell.Root pressable={false}>
            <Cell.Content>
              <Cell.Label variant="primary">{messageToSign}</Cell.Label>
            </Cell.Content>
          </Cell.Root>
        </Approver.Section>
      </Approver.Container>
      <Approver.Footer>
        <ApproverButtons onBack={onCloseApprover} onClose={onCloseApprover} onApprove={onApprove} />
      </Approver.Footer>
    </Approver>
  );
}
