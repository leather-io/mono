import { ApproverAccountCard } from '@/features/approver/components/approver-account-card';
import { Account } from '@/store/accounts/accounts';
import { makeAccountIdentifer } from '@/store/utils';
import { t } from '@lingui/macro';

import { Approver, Button, Cell, Text } from '@leather.io/ui/native';

import { ApproverWrapper } from '../components/approver-wrapper';
import { StructuredMessageSection } from '../structured-message.section';

interface BaseStxMessageApproverLayoutProps {
  onApprove(): void;
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
  onApprove,
  onCloseApprover,
  accountId,
  accounts,
  messageToSign,
}: BaseStxMessageApproverLayoutProps) {
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
            <ApproverAccountCard
              accounts={accounts.filter(
                acc => makeAccountIdentifer(acc.fingerprint, acc.accountIndex) === accountId
              )}
            />
          </Approver.Section>
          {messageToSign.messageType === 'utf8' && (
            <Approver.Section>
              <Text variant="label01">
                {t({
                  id: 'approver.signMessage.message-subtitle',
                  message: 'Message',
                })}
              </Text>
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
    </ApproverWrapper>
  );
}
