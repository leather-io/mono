import { ApproverAccountCard } from '@/features/approver/components/approver-account-card';
import { ApproverPermissions } from '@/features/approver/components/approver-permissions';
import { Account } from '@/store/accounts/accounts';
import { makeAccountIdentifer } from '@/store/utils';
import { t } from '@lingui/macro';

import { Approver, Box, Button, Cell, ChevronRightIcon } from '@leather.io/ui/native';

interface GetAddressesApproverLayoutProps {
  onApprove(): void;
  onOpenAccountSelection(): void;
  onCloseApprover(): void;
  selectedAccountId: string | null;
  accounts: Account[];
}

export function GetAddressesApproverLayout({
  onApprove,
  onOpenAccountSelection,
  onCloseApprover,
  selectedAccountId,
  accounts,
}: GetAddressesApproverLayoutProps) {
  return (
    <Box flex={1} backgroundColor="ink.background-secondary">
      <Approver>
        <Approver.Container>
          <Approver.Header
            title={t({
              id: 'approver.connect.title',
              message: 'Connect',
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
                      message: 'Please, choose an account',
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
            <ApproverPermissions permissions={['request_approval', 'view_balance_activity']} />
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
