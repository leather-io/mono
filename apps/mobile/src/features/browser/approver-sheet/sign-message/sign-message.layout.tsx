import { ApproverAccountCard } from '@/features/approver/components/approver-account-card';
import { ApproverWrapper } from '@/features/approver/components/approver-wrapper';
import { Account } from '@/store/accounts/accounts';
import { makeAccountIdentifer } from '@/store/utils';
import { t } from '@lingui/macro';

import { Approver, Button, Cell, ChevronRightIcon, Text } from '@leather.io/ui/native';

interface SignMessageApproverLayoutProps {
  onApprove(): void;
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
    <ApproverWrapper>
      <Approver>
        <Approver.Container>
          <Approver.Header
            title={t({
              id: 'approver.signMessage.title',
              message: 'Sign Message',
            })}
          />
          <Approver.Section>
            {selectedAccountId ? (
              <ApproverAccountCard
                accounts={accounts.filter(
                  acc =>
                    makeAccountIdentifer(acc.fingerprint, acc.accountIndex) === selectedAccountId
                )}
                onPress={onOpenAccountSelection}
              />
            ) : (
              <Cell.Root pressable={true} onPress={onOpenAccountSelection}>
                <Cell.Content>
                  <Cell.Label variant="primary">
                    {t({
                      id: `browser.approver.choose-account`,
                      message: 'Choose an account',
                    })}
                  </Cell.Label>
                </Cell.Content>
                <Cell.Aside>
                  <ChevronRightIcon />
                </Cell.Aside>
              </Cell.Root>
            )}
          </Approver.Section>
          <Approver.Section>
            <Text variant="label01">
              {t({
                id: 'approver.signMessage.message-subtitle',
                message: 'Message',
              })}
            </Text>
            <Cell.Root pressable={false}>
              <Cell.Content>
                <Cell.Label variant="primary">{messageToSign}</Cell.Label>
              </Cell.Content>
            </Cell.Root>
          </Approver.Section>
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
    </ApproverWrapper>
  );
}
