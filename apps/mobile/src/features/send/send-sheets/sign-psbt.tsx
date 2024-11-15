import { ApproverAccountCard } from '@/features/approver/components/approver-account-card';
import { CodeCard } from '@/features/approver/components/code-card';
import { FeeCard } from '@/features/approver/components/fee-card';
import { InputsAndOutputsCard } from '@/features/approver/components/inputs-outputs-card';
import { OutcomesCard } from '@/features/approver/components/outcomes-card';
import { t } from '@lingui/macro';
import { useTheme } from '@shopify/restyle';

import { FeeTypes } from '@leather.io/models';
import { Approver, ArrowLeftIcon, Box, Button, Text, Theme } from '@leather.io/ui/native';

export function SignPsbt() {
  const theme = useTheme<Theme>();

  function getButtons(buttonState: 'start' | 'approving' | 'success') {
    switch (buttonState) {
      case 'start':
        return (
          <>
            <Button
              buttonState="outline"
              title={t({
                id: 'approver.button.edit',
                message: 'Edit',
              })}
              flex={1}
            />
            <Button
              buttonState="default"
              title={t({
                id: 'approver.button.approve',
                message: 'Approve',
              })}
              flex={1}
            />
          </>
        );
      case 'success':
        return null;

      case 'approving':
        return (
          <Button
            buttonState="default"
            title={t({
              id: 'approver.button.undo_approval',
              message: 'Undo approval',
            })}
            icon={<ArrowLeftIcon color={theme.colors['ink.background-primary']} />}
          />
        );
    }
  }

  return (
    <Approver requester="https://google.com">
      <Approver.Container>
        <Approver.Header
          title={t({
            id: 'approver.send.title',
            message: 'Send',
          })}
        />
        <Approver.Section>
          <ApproverAccountCard />
        </Approver.Section>
        <Approver.Section>
          <OutcomesCard />
        </Approver.Section>
        <Approver.Section>
          <FeeCard feeType={FeeTypes.Middle} />
        </Approver.Section>
        <Approver.Advanced
          titleClosed={t({
            id: 'approver.advanced.show',
            message: 'Show advanced options',
          })}
          titleOpened={t({
            id: 'approver.advanced.show',
            message: 'Hide advanced options',
          })}
        >
          <Approver.Section noTopPadding>
            <InputsAndOutputsCard />
          </Approver.Section>
          <Approver.Section>
            <CodeCard />
          </Approver.Section>
        </Approver.Advanced>
      </Approver.Container>
      <Approver.Footer>
        <Box flexDirection="row" alignItems="center" justifyContent="space-between">
          <Text variant="label02">
            {t({
              id: 'approver.total_spend',
              message: 'Total spend',
            })}
          </Text>
          <Text variant="label02">{t`$100`}</Text>
        </Box>
        <Approver.Actions>{getButtons('start')}</Approver.Actions>
      </Approver.Footer>
    </Approver>
  );
}
