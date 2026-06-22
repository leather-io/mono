import { VStack, styled } from 'leather-styles/jsx';

import { Approver, Button, Callout } from '@leather.io/ui';

import { closeWindow } from '@shared/utils';

import { useSwitchAccountSheet } from '@app/common/switch-account/use-switch-account-sheet-context';
import { CurrentAccountDisplayer } from '@app/features/current-account/current-account-displayer';
import { useOnOriginTabClose } from '@app/routes/hooks/use-on-tab-closed';

import { policyAccountCallout } from '../policy-account-match';
import { useStxAddAccount } from './use-stx-add-account';

export function RpcStxAddAccount() {
  const {
    origin,
    name,
    publicKeys,
    threshold,
    matchStatus,
    canApprove,
    focusInitiatingTab,
    onUserApprovesAddAccount,
  } = useStxAddAccount();

  useOnOriginTabClose(() => closeWindow());

  const { toggleSwitchAccount } = useSwitchAccountSheet();

  if (origin === null) {
    closeWindow();
    throw new Error('Origin is null');
  }

  function onApprove() {
    onUserApprovesAddAccount();
    closeWindow();
  }

  const callout = policyAccountCallout(matchStatus, 'Stacks');

  return (
    <Approver requester={origin} width="100%">
      <Approver.Header title="Add multisig account" onPressRequestedByLink={focusInitiatingTab} />
      <Approver.Section>
        <Approver.Subheader>With account</Approver.Subheader>
        <CurrentAccountDisplayer onSelectAccount={toggleSwitchAccount} />
        <Callout variant={callout.variant} mt="space.04" mb="space.03">
          {callout.message}
        </Callout>
      </Approver.Section>
      <Approver.Section>
        <Approver.Subheader>Account name</Approver.Subheader>
        <styled.p textStyle="caption.01" pb="space.03">
          {name}
        </styled.p>
      </Approver.Section>
      <Approver.Section>
        <Approver.Subheader>Signing policy</Approver.Subheader>
        <styled.p textStyle="caption.01" pb="space.03">
          {threshold} of {publicKeys.length}
        </styled.p>
      </Approver.Section>
      <Approver.Section>
        <Approver.Subheader>Public keys</Approver.Subheader>
        <VStack gap="space.01" alignItems="start" pb="space.03">
          {publicKeys.map(publicKey => (
            <styled.p key={publicKey} textStyle="caption.01" wordBreak="break-all">
              {publicKey}
            </styled.p>
          ))}
        </VStack>
      </Approver.Section>
      <Approver.Actions
        actions={[
          <Button key="deny" variant="outline" onClick={() => closeWindow()}>
            Deny
          </Button>,
          <Button
            key="confirm"
            disabled={!canApprove}
            onClick={onApprove}
            data-testid="stx-add-account-approve-button"
          >
            Confirm
          </Button>,
        ]}
      />
    </Approver>
  );
}
