import { ApproverAccountCard } from '@/features/approver/components/approver-account-card';
import { Account } from '@/store/accounts/accounts';
import { t } from '@lingui/core/macro';

import { makeAccountIdentifer } from '@leather.io/crypto';
import { Approver, Cell, Text } from '@leather.io/ui/native';

import { ApproverButtons } from '../components/approver-buttons';
import { StructuredMessageSection } from '../structured-message.section';

interface BaseStxMessageApproverLayoutProps {
  origin: string;
  onApprove(): Promise<void>;
  onCloseApprover(): void;
  accountId: string | null;
  accounts: Account[];
  messageToSign:
    | {
        messageType: 'utf8';
        message: string;
      }
    | {
        messageType: 'structured';
        message: string;
        domain: string;
      };
}

export function BaseStxMessageApproverLayout({
  origin,
  onApprove,
  onCloseApprover,
  accountId,
  accounts,
  messageToSign,
}: BaseStxMessageApproverLayoutProps) {
  return (
    <Approver requester={origin}>
      <Approver.Container>
        <Approver.Header title={t`Sign Message`} />
        <Approver.Section>
          <ApproverAccountCard
            accounts={accounts.filter(
              acc => makeAccountIdentifer(acc.fingerprint, acc.accountIndex) === accountId
            )}
          />
        </Approver.Section>
        {messageToSign.messageType === 'utf8' && (
          <Approver.Section>
            <Text variant="label01">{t`Message`}</Text>
            <Cell.Root pressable={false}>
              <Cell.Content>
                <Cell.Label variant="primary">{messageToSign.message}</Cell.Label>
              </Cell.Content>
            </Cell.Root>
          </Approver.Section>
        )}
        {messageToSign.messageType === 'structured' && (
          <StructuredMessageSection messageToSign={messageToSign} />
        )}
      </Approver.Container>
      <Approver.Footer>
        <ApproverButtons onBack={onCloseApprover} onClose={onCloseApprover} onApprove={onApprove} />
      </Approver.Footer>
    </Approver>
  );
}
