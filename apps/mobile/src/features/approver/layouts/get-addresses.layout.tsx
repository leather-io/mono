import { ApproverAccountCard } from '@/features/approver/components/approver-account-card';
import { ApproverPermissions } from '@/features/approver/components/approver-permissions';
import { Account } from '@/store/accounts/accounts';
import { t } from '@lingui/core/macro';

import { makeAccountIdentifer } from '@leather.io/crypto';
import { Approver, Cell, ChevronRightIcon } from '@leather.io/ui/native';

import { ApproverButtons } from '../components/approver-buttons';

interface GetAddressesApproverLayoutProps {
  requester: string;
  onApprove(): void;
  onOpenAccountSelection(): void;
  onCloseApprover(): void;
  selectedAccountId: string | null;
  accounts: Account[];
  isSubmitDisabled: boolean;
}

export function GetAddressesApproverLayout({
  requester,
  onApprove,
  onOpenAccountSelection,
  onCloseApprover,
  selectedAccountId,
  accounts,
  isSubmitDisabled,
}: GetAddressesApproverLayoutProps) {
  return (
    <Approver requester={requester}>
      <Approver.Container>
        <Approver.Header showLargeFavicon title={t`Connect`} />
        <Approver.Section mb="1">
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
          <ApproverPermissions permissions={['request_approval', 'view_balance_activity']} />
        </Approver.Section>
      </Approver.Container>
      <Approver.Footer>
        <ApproverButtons
          onBack={onCloseApprover}
          onClose={onCloseApprover}
          isSubmitDisabled={isSubmitDisabled}
          onApprove={onApprove}
        />
      </Approver.Footer>
    </Approver>
  );
}
